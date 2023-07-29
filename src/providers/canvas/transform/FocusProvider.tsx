import { Vector } from '@shopify/react-native-skia';
import { createContext, useContext } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import {
  DEFAULT_FOCUS_ANIMATION_SETTINGS,
  DEFAULT_GESTURE_ANIMATION_SETTINGS
} from '@/constants/animations';
import { useAutoSizingContext, useCanvasDataContext } from '@/providers/canvas';
import {
  BlurData,
  FocusData,
  FocusEndFunction,
  FocusStartFunction
} from '@/types/focus';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { Maybe } from '@/types/utils';
import { calcScaleOnProgress, calcTranslationOnProgress } from '@/utils/views';

import { useTransformContext } from './TransformProvider';

type FocusVertexTransition = {
  scale: SharedValue<number>;
  x: SharedValue<number>;
  y: SharedValue<number>;
};

export type FocusContextType = {
  blur: {
    origin: SharedValue<Vector | null>;
    translationX: SharedValue<number>;
    translationY: SharedValue<number>;
  };
  endFocus: FocusEndFunction;
  focus: {
    end: FocusVertexTransition;
    key: SharedValue<null | string>;
    start: FocusVertexTransition;
  };
  focusStatus: SharedValue<FocusStatus>;
  gesturesDisabled: SharedValue<boolean>;
  startFocus: FocusStartFunction;
  status: SharedValue<FocusStatus>;
  transitionProgress: SharedValue<number>;
};

const FocusContext = createContext(null as unknown as object);

export const useFocusContext = () => {
  const contextValue = useContext(FocusContext);

  if (!contextValue) {
    throw new Error('useFocusContext must be used within a FocusProvider');
  }

  return contextValue as FocusContextType;
};

export enum FocusStatus {
  BLUR = 'BLUR',
  BLUR_TRANSITION = 'BLUR_TRANSITION',
  FOCUS = 'FOCUS',
  FOCUS_PREPARATION = 'FOCUS_PREPARATION',
  FOCUS_TRANSITION = 'FOCUS_TRANSITION'
}

type FocusProviderProps = {
  children?: React.ReactNode;
};

export default function FocusProvider({ children }: FocusProviderProps) {
  // OTHER CONTEXTS VALUES
  // Canvas data context values
  const { canvasDimensions, currentScale, currentTranslation, initialScale } =
    useCanvasDataContext();
  // Canvas transform context values
  const {
    getTranslateClamp,
    resetContainerPosition,
    resetContainerPositionOnProgress,
    scaleContentTo,
    translateContentTo
  } = useTransformContext();
  // Auto sizing context values
  const autoSizingContext = useAutoSizingContext();

  // CONTEXT VALUES - FOCUS
  // Helper value for disabling gestures
  const gesturesDisabled = useSharedValue(false);
  // This value is used to indicate what is the current focus key
  // (e.g. the key of the focused vertex)
  const focusKey = useSharedValue<null | string>(null);
  // Focus transition target vertex data
  const endX = useSharedValue(0);
  const endY = useSharedValue(0);
  const endScale = useSharedValue(1);
  // Focus transition start vertex data
  const useCustomSource = useSharedValue(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);

  // CONTEXT VALUES - BLUR
  const blurTranslationX = useSharedValue(0);
  const blurTranslationY = useSharedValue(0);
  // The start point of the gesture-triggered blur animation
  const blurOrigin = useSharedValue<Vector | null>(null);

  // This value is used to indicate what is the current focus status
  const focusStatus = useSharedValue(FocusStatus.BLUR);

  // HELPER VALUES
  // Focus/Blur transition
  const animationSettings =
    useSharedValue<AnimationSettingsWithDefaults | null>(null);
  const transitionStartPosition = useSharedValue({ x: 0, y: 0 });
  const transitionStartScale = useSharedValue(0);
  const transitionProgress = useSharedValue(1);

  /**
   * PRIVATE FUNCTIONS
   */
  const updateTransitionProgress = (
    animSettings: AnimationSettingsWithDefaults
  ) => {
    'worklet';
    transitionProgress.value = 0;
    const { onComplete, ...timingConfig } = animSettings;
    transitionProgress.value = withTiming(
      1,
      timingConfig,
      (finished?: boolean) => {
        'worklet';
        if (onComplete) {
          runOnJS(onComplete)(finished);
        }
      }
    );
  };

  const startTransition = (
    key: null | string,
    transitionType: FocusStatus.BLUR_TRANSITION | FocusStatus.FOCUS_TRANSITION,
    animSettings: AnimationSettingsWithDefaults | null
  ) => {
    'worklet';
    // Set initial values for the transition
    if (!useCustomSource.value) {
      transitionStartPosition.value = {
        x: currentTranslation.x.value,
        y: currentTranslation.y.value
      };
      transitionStartScale.value = currentScale.value;
    }
    // Turn on the animated reaction that will handle the animation
    focusStatus.value = transitionType;
    focusKey.value = key;
    // Update the transition progress automatically if the animation
    // settings are provided
    if (animSettings) updateTransitionProgress(animSettings);
  };

  const handleContainerReset = (
    animSettings: AnimationSettingsWithDefaults | null
  ) => {
    'worklet';
    // Reset the container position with animation if it is provided
    if (animSettings) {
      focusStatus.value = FocusStatus.BLUR_TRANSITION;
      focusKey.value = null;
      updateTransitionProgress(animSettings);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onComplete: _, ...timingConfig } = animSettings;
      resetContainerPosition({
        animationSettings: timingConfig,
        autoSizingContext
      });
    }
    // Otherwise, reset the container based on progress updated from the
    // outside (e.g. from MultiStepFocusProvider)
    // The function below will trigger the animated reaction that will
    // handle the animation based on the progress updated from the outside
    else {
      startTransition(null, FocusStatus.BLUR_TRANSITION, null);
    }
  };

  /**
   * EXPOSED FUNCTIONS
   */

  // Focus setter
  const startFocus = (
    data: FocusData,
    animSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => {
    'worklet';
    // Reset blur settings
    blurOrigin.value = null;
    // Disable auto sizing when focusing
    autoSizingContext.disableAutoSizing();
    // Turn off animated reaction until data is completely set
    focusStatus.value = FocusStatus.FOCUS_PREPARATION;
    // Set focus data
    useCustomSource.value = !!data.customSource;
    focusKey.value = data.key;
    gesturesDisabled.value = data.gesturesDisabled;
    animationSettings.value =
      animSettings === undefined
        ? DEFAULT_FOCUS_ANIMATION_SETTINGS
        : animSettings;
  };

  // Blur setter
  const endFocus = (
    data?: Maybe<BlurData>,
    animSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => {
    'worklet';
    const updatedAnimSettings = (animationSettings.value =
      animSettings === undefined
        ? DEFAULT_FOCUS_ANIMATION_SETTINGS
        : animSettings);
    // Do nothing if there is no focus applied
    if (focusStatus.value === FocusStatus.BLUR) {
      return;
    }
    // Turn off focus without animation if data is null
    if (data === null) {
      focusStatus.value = FocusStatus.BLUR;
      gesturesDisabled.value = false;
      focusKey.value = null;
      // This fakes the transition progress in order to ensure that
      // graph components will be transitioned smoothly between the
      // focus and blur states (e.g the opacity of unfocused components
      // will be animated to 1 smoothly)
      // (If animation settings are not provided, the progress must be
      // updated from the outside)
      if (updatedAnimSettings) updateTransitionProgress(updatedAnimSettings);
    } else {
      useCustomSource.value = !!data?.customSource;
      // Set focus data if the origin is provided
      // (prepare for the automatic blur animation)
      if (data?.origin) {
        animationSettings.value = updatedAnimSettings;
        blurOrigin.value = data.origin;
      }
      // Otherwise, reset the container position
      else {
        handleContainerReset(updatedAnimSettings);
      }
    }
  };

  /*
   * HELPER REACTIONS
   */

  // This reaction is used to update the start scale and translation
  // of the container during the focus/blur transition based on
  // the source coordinates set from outside
  useAnimatedReaction(
    () => {
      if (!useCustomSource.value) return null;
      return {
        scale: startScale.value,
        x: startX.value,
        y: startY.value
      };
    },
    data => {
      if (!data) return;
      transitionStartPosition.value = {
        x: canvasDimensions.width.value / 2 - data.x * data.scale,
        y: canvasDimensions.height.value / 2 - data.y * data.scale
      };
      transitionStartScale.value = data.scale;
    }
  );

  // This is used to start the focus transition
  // (it checks if canvas is rendered and delays transition until it is)
  useAnimatedReaction(
    () => ({
      canvasRendered: !!(
        canvasDimensions.width.value && canvasDimensions.height.value
      ),
      key: focusKey.value
    }),
    ({ canvasRendered, key }) => {
      if (
        key === null ||
        !canvasRendered ||
        focusStatus.value !== FocusStatus.FOCUS_PREPARATION
      ) {
        return;
      }
      startTransition(
        key,
        FocusStatus.FOCUS_TRANSITION,
        animationSettings.value
      );
    }
  );

  // This is used to start the blur transition with the provided origin
  useAnimatedReaction(
    () => ({
      origin: blurOrigin.value
    }),
    ({ origin }) => {
      if (!origin) return;
      startTransition(
        null,
        FocusStatus.BLUR_TRANSITION,
        animationSettings.value
      );
    }
  );

  // This is used to finish the focus transition once the progress reaches 1
  const isInitialFinishRender = useSharedValue(true);
  useAnimatedReaction(
    () => transitionProgress.value,
    progress => {
      if (isInitialFinishRender.value) {
        isInitialFinishRender.value = false;
        return;
      }
      if (progress !== 1) return;
      const currentStatus = focusStatus.value;
      const finishStatus =
        currentStatus === FocusStatus.FOCUS_TRANSITION
          ? FocusStatus.FOCUS
          : FocusStatus.BLUR;
      // Set the finish status
      focusStatus.value = finishStatus;
      // Enable gestures and change the container position to fit
      // into the canvas bounds if it's out of them
      if (finishStatus === FocusStatus.BLUR) {
        gesturesDisabled.value = false;
        translateContentTo(
          {
            x: currentTranslation.x.value,
            y: currentTranslation.y.value
          },
          getTranslateClamp(currentScale.value),
          DEFAULT_GESTURE_ANIMATION_SETTINGS
        );
      }
    }
  );

  /**
   * ANIMATION HANDLING REACTIONS
   */

  // Focus animation handler (from unfocused to focused state) and
  // translation when vertex moves
  useAnimatedReaction(
    () => {
      const status = focusStatus.value;
      if (
        status !== FocusStatus.FOCUS_TRANSITION &&
        status !== FocusStatus.FOCUS
      ) {
        return null;
      }

      return {
        progress: status === FocusStatus.FOCUS ? 1 : transitionProgress.value,
        sourcePosition: transitionStartPosition.value,
        sourceScale: transitionStartScale.value,
        targetPosition: {
          x: canvasDimensions.width.value / 2 - endX.value * endScale.value,
          y: canvasDimensions.height.value / 2 - endY.value * endScale.value
        },
        targetScale: endScale.value
      };
    },
    data => {
      // Don't do anything if there is no data
      if (!data) return;
      const {
        progress,
        sourcePosition,
        sourceScale,
        targetPosition,
        targetScale
      } = data;
      // Scale the content to the focus scale
      scaleContentTo(calcScaleOnProgress(progress, sourceScale, targetScale));
      // Translate the content to the focus position
      translateContentTo(
        calcTranslationOnProgress(progress, sourcePosition, targetPosition)
      );
    }
  );

  // Blur animation handler (from focused to unfocused state)
  // (when the blur origin is provided)
  useAnimatedReaction(
    () => {
      const status = focusStatus.value;
      const origin = blurOrigin.value;
      if (status !== FocusStatus.BLUR_TRANSITION || !origin) {
        return null;
      }

      return {
        origin,
        progress: transitionProgress.value,
        sourcePosition: transitionStartPosition.value,
        sourceScale: transitionStartScale.value,
        targetScale: initialScale.value,
        translation: {
          x: blurTranslationX.value,
          y: blurTranslationY.value
        }
      };
    },
    data => {
      // Don't do anything if there is no data
      if (!data) return;
      const {
        origin,
        progress,
        sourcePosition,
        sourceScale,
        targetScale,
        translation
      } = data;
      // Scale the content to the initial scale
      const newScale = calcScaleOnProgress(progress, sourceScale, targetScale);
      scaleContentTo(newScale);
      // Translate the content to the user's finger position
      const translateScale = newScale / sourceScale - 1;
      translateContentTo({
        x:
          sourcePosition.x -
          (origin.x - sourcePosition.x) * translateScale +
          translation.x,
        y:
          sourcePosition.y -
          (origin.y - sourcePosition.y) * translateScale +
          translation.y
      });
    }
  );

  // Blur animation handler (from focused to unfocused state)
  // (when the blur origin is not provided and the progress
  // is updated from the outside)
  useAnimatedReaction(
    () => {
      const status = focusStatus.value;
      if (
        (status !== FocusStatus.BLUR_TRANSITION &&
          status !== FocusStatus.BLUR) ||
        animationSettings.value ||
        transitionStartScale.value === 0
      ) {
        return null;
      }

      return {
        progress: transitionProgress.value,
        sourceScale: transitionStartScale.value,
        startPosition: transitionStartPosition.value
      };
    },
    data => {
      // Don't do anything if there is no data
      if (!data) return;
      const { progress, sourceScale, startPosition } = data;
      // Reset the container position based on the progress
      resetContainerPositionOnProgress(progress, sourceScale, startPosition, {
        autoSizingContext
      });
    }
  );

  // This component never re-renders so there is no need for memoization
  const contextValue: FocusContextType = {
    blur: {
      origin: blurOrigin,
      // These 2 values must be updated by the external provider
      // if the blur origin is provided in the blur data
      translationX: blurTranslationX,
      translationY: blurTranslationY
    },
    endFocus,
    focus: {
      end: {
        // These 3 values must be updated by the external provider
        scale: endScale,
        x: endX,
        y: endY
      },
      key: focusKey,
      start: {
        // These 3 values should be updated only if the transition
        // start point is the specific point on canvas
        // (e.g. see the multi step focus where the transition start
        // points is another vertex)
        scale: startScale,
        x: startX,
        y: startY
      }
    },
    focusStatus,
    gesturesDisabled,
    startFocus,
    status: focusStatus,
    transitionProgress
  };

  return (
    <FocusContext.Provider value={contextValue}>
      {children}
    </FocusContext.Provider>
  );
}

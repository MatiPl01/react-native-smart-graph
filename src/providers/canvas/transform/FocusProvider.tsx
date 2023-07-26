import { vec, Vector } from '@shopify/react-native-skia';
import { createContext, useContext, useMemo } from 'react';
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

export type FocusContextType = {
  blur: {
    origin: SharedValue<Vector | null>;
    translationX: SharedValue<number>;
    translationY: SharedValue<number>;
  };
  endFocus: FocusEndFunction;
  focus: {
    key: SharedValue<null | string>;
    scale: SharedValue<number>;
    x: SharedValue<number>;
    y: SharedValue<number>;
  };
  focusStatus: SharedValue<FocusStatus>;
  focusTransitionProgress: SharedValue<number>;
  gesturesDisabled: SharedValue<boolean>;
  startFocus: FocusStartFunction;
  status: SharedValue<number>;
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
  FOCUS_PREPARATION,
  FOCUS_TRANSITION,
  FOCUS,
  BLUR_TRANSITION,
  BLUR
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
  // Focused vertex data
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusScale = useSharedValue(1);

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
  const transitionProgress = useSharedValue(1);
  const transitionStartPosition = useSharedValue<Vector>(vec(0, 0));
  const transitionStartScale = useSharedValue<number>(0);

  /**
   * PRIVATE FUNCTIONS
   */
  const updateTransitionProgress = (
    animSettings: AnimationSettingsWithDefaults | null
  ) => {
    'worklet';
    // Reset the transition progress
    // (if animation settings are provided, the progress will be updated automatically)
    // (otherwise, it must be updated manually)
    transitionProgress.value = 0;
    // Update the transition progress automatically if animation settings are provided
    if (animSettings) {
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
    }
  };

  const startTransition = (
    key: null | string,
    transitionType: FocusStatus.BLUR_TRANSITION | FocusStatus.FOCUS_TRANSITION,
    animSettings: AnimationSettingsWithDefaults | null
  ) => {
    'worklet';
    // Set initial values for the transition
    transitionStartPosition.value = {
      x: currentTranslation.x.value,
      y: currentTranslation.y.value
    };
    transitionStartScale.value = currentScale.value;
    // Turn on the animated reaction that will handle the animation
    focusStatus.value = transitionType;
    focusKey.value = key;
    // Update the transition progress
    updateTransitionProgress(animSettings);
  };

  const handleContainerReset = (
    animSettings: AnimationSettingsWithDefaults | null
  ) => {
    'worklet';
    focusStatus.value = FocusStatus.BLUR_TRANSITION;
    focusKey.value = null;
    updateTransitionProgress(animSettings);
    // Reset the container position with animation if it is provided
    if (animSettings) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onComplete: _, ...timingConfig } = animSettings;
      resetContainerPosition({
        animationSettings: timingConfig,
        autoSizingContext
      });
    }
    // Otherwise, reset the container and update the transition progress manually
    // from the outside
    else {
      resetContainerPosition({ animationSettings: null, autoSizingContext });
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
    console.log('start', data, animSettings);
    // Reset blur settings
    blurOrigin.value = null;
    // Disable auto sizing when focusing
    autoSizingContext.disableAutoSizing();
    // Turn off animated reaction until data is completely set
    focusStatus.value = FocusStatus.FOCUS_PREPARATION;
    // Set focus data
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
    console.log('end', data, animSettings);
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
      updateTransitionProgress(updatedAnimSettings);
    }
    // Set focus data if it is provided (to prepare for the transition)
    else if (data) {
      animationSettings.value = updatedAnimSettings;
      blurOrigin.value = data.origin;
    }
    // Otherwise, just reset the container position
    else {
      handleContainerReset(updatedAnimSettings);
    }
  };

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
      if (!key || !canvasRendered) return;
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
  useAnimatedReaction(
    () => transitionProgress.value,
    progress => {
      if (progress !== 1) return;
      const currentStatus = focusStatus.value;
      const finishStatus =
        currentStatus === FocusStatus.BLUR_TRANSITION ||
        currentStatus === FocusStatus.BLUR
          ? FocusStatus.BLUR
          : FocusStatus.FOCUS;
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
   * ANIMATION HANDLERS
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
        progress: transitionProgress.value,
        startPosition: transitionStartPosition.value,
        startScale: transitionStartScale.value,
        targetPosition: {
          x: canvasDimensions.width.value / 2 - focusX.value * focusScale.value,
          y: canvasDimensions.height.value / 2 - focusY.value * focusScale.value
        },
        targetScale: focusScale.value
      };
    },
    data => {
      // Don't do anything if there is no data
      if (!data) return;
      const {
        progress,
        startPosition,
        startScale,
        targetPosition,
        targetScale
      } = data;
      // Scale the content to the focus scale
      scaleContentTo(calcScaleOnProgress(progress, startScale, targetScale));
      // Translate the content to the focus position
      translateContentTo(
        calcTranslationOnProgress(progress, startPosition, targetPosition)
      );
    }
  );

  // Blur animation handler (from focused to unfocused state)
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
        startPosition: transitionStartPosition.value,
        startScale: transitionStartScale.value,
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
        startPosition,
        startScale,
        targetScale,
        translation
      } = data;
      // Scale the content to the initial scale
      const newScale = calcScaleOnProgress(progress, startScale, targetScale);
      scaleContentTo(newScale);
      // Translate the content to the user's finger position
      const translateScale = newScale / startScale - 1;
      translateContentTo({
        x:
          startPosition.x -
          (origin.x - startPosition.x) * translateScale +
          translation.x,
        y:
          startPosition.y -
          (origin.y - startPosition.y) * translateScale +
          translation.y
      });
    }
  );

  const contextValue = useMemo<FocusContextType>(
    () => ({
      blur: {
        origin: blurOrigin,
        // These 2 values must be updated by the external provider
        translationX: blurTranslationX,
        translationY: blurTranslationY
      },
      endFocus,
      focus: {
        key: focusKey,
        // These 3 values must be updated by the external provider
        scale: focusScale,
        x: focusX,
        y: focusY
      },
      focusStatus,
      focusTransitionProgress: transitionProgress,
      gesturesDisabled,
      startFocus,
      status: focusStatus
    }),
    []
  );

  return (
    <FocusContext.Provider value={contextValue}>
      {children}
    </FocusContext.Provider>
  );
}

import { vec, Vector } from '@shopify/react-native-skia';
import { createContext, useContext, useMemo } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  useWorkletCallback,
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
  // CONTEXT VALUES
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
   * EXPOSED FUNCTIONS
   */

  // Focus setter
  const startFocus = useWorkletCallback(
    (data: FocusData, animSettings?: Maybe<AnimationSettingsWithDefaults>) => {
      // Turn off animated reaction until data is completely set
      focusStatus.value = FocusStatus.FOCUS_PREPARATION;
      focusKey.value = data.key;
      // Set focus data
      gesturesDisabled.value = data.gesturesDisabled;
      animationSettings.value =
        animSettings === undefined
          ? DEFAULT_FOCUS_ANIMATION_SETTINGS
          : animSettings;

      // Disable auto sizing when focusing
      autoSizingContext.disableAutoSizing();
    },
    []
  );

  // Blur setter
  const endFocus = useWorkletCallback(
    (
      data?: Maybe<BlurData>,
      animSettings?: Maybe<AnimationSettingsWithDefaults>
    ) => {
      const updatedAnimSettings =
        animSettings === undefined
          ? DEFAULT_FOCUS_ANIMATION_SETTINGS
          : animSettings;
      // Do nothing if there is no focus applied
      if (focusStatus.value === FocusStatus.BLUR) {
        return;
      }
      // Turn off focus without animation if data is null
      if (data === null) {
        focusStatus.value = FocusStatus.BLUR;
        gesturesDisabled.value = false;
        focusKey.value = null;
        updateTransitionProgress(FocusStatus.BLUR, updatedAnimSettings);
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
    },
    []
  );

  /**
   * PRIVATE FUNCTIONS
   */
  const finishTransition = useWorkletCallback((finishStatus: FocusStatus) => {
    // Dismiss the transition if the new focus is pending
    // (the new transition is being prepared or is in progress)
    const currentStatus = focusStatus.value;
    if (
      ((finishStatus === FocusStatus.FOCUS &&
        currentStatus === FocusStatus.FOCUS_TRANSITION) ||
        (finishStatus === FocusStatus.BLUR &&
          currentStatus === FocusStatus.BLUR_TRANSITION)) &&
      transitionProgress.value === 1
    ) {
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
  }, []);

  const updateAnimationSettingsWithFinishCallback = useWorkletCallback(
    (
      animSettings: AnimationSettingsWithDefaults,
      finishStatus: FocusStatus
    ) => {
      const { onComplete, ...timingConfig } = animSettings;
      return {
        ...timingConfig,
        onComplete: (finished?: boolean) => {
          'worklet';
          finishTransition(finishStatus);
          if (onComplete) {
            runOnJS(onComplete)(finished);
          }
        }
      };
    },
    []
  );

  const updateTransitionProgress = useWorkletCallback(
    (
      finishStatus: FocusStatus,
      animSettings: AnimationSettingsWithDefaults | null
    ) => {
      if (animSettings) {
        const { onComplete, ...timingConfig } =
          updateAnimationSettingsWithFinishCallback(animSettings, finishStatus);
        transitionProgress.value = 0;
        transitionProgress.value = withTiming(1, timingConfig, onComplete);
      } else {
        finishTransition(finishStatus);
      }
    },
    []
  );

  const startTransition = useWorkletCallback(
    (
      key: null | string,
      transitionType:
        | FocusStatus.BLUR_TRANSITION
        | FocusStatus.FOCUS_TRANSITION,
      animSettings: AnimationSettingsWithDefaults | null
    ) => {
      const finishStatus =
        transitionType === FocusStatus.BLUR_TRANSITION
          ? FocusStatus.BLUR
          : FocusStatus.FOCUS;
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
      updateTransitionProgress(finishStatus, animSettings);
    },
    []
  );

  const handleContainerReset = useWorkletCallback(
    (animSettings: AnimationSettingsWithDefaults | null) => {
      focusStatus.value = FocusStatus.BLUR_TRANSITION;
      focusKey.value = null;
      updateTransitionProgress(FocusStatus.BLUR, animSettings);
      // Reset the container position with animation if it is provided
      if (animSettings) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { onComplete: _, ...timingConfig } = animSettings;
        resetContainerPosition({
          animationSettings: timingConfig,
          autoSizingContext
        });
      }
      // Otherwise, reset the container position without animation
      else {
        resetContainerPosition({ autoSizingContext });
      }
    },
    []
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
      if (!key || !canvasRendered) return;
      startTransition(
        key,
        FocusStatus.FOCUS_TRANSITION,
        animationSettings.value
      );
      blurOrigin.value = null;
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
        animationSettings.value ?? DEFAULT_FOCUS_ANIMATION_SETTINGS
      );
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

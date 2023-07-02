import { vec, Vector } from '@shopify/react-native-skia';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
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
  FocusEndSetter,
  FocusStartSetter
} from '@/types/focus';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { Maybe } from '@/types/utils';
import { calcScaleOnProgress, calcTranslationOnProgress } from '@/utils/views';

import { useTransformContext } from './TransformProvider';

type FocusContextType = {
  endFocus: FocusEndSetter;
  focusKey: SharedValue<null | string>;
  focusStatus: SharedValue<number>;
  focusTransitionProgress: SharedValue<number>;
  gesturesDisabled: SharedValue<boolean>;
  startFocus: FocusStartSetter;
};

const FocusContext = createContext(null);

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

type FocusState = {
  animationSettings: AnimationSettingsWithDefaults | null;
  data: FocusData;
};

type BlurState = {
  animationSettings: AnimationSettingsWithDefaults | null;
  data: BlurData;
};

type FocusProviderProps = {
  children?: React.ReactNode;
  initialScale: number;
};

export default function FocusProvider({
  children,
  initialScale
}: FocusProviderProps) {
  // CONTEXT VALUES
  // Canvas data context values
  const { canvasDimensions, currentScale, currentTranslation } =
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

  // CONTEXT VALUES
  // Helper value for disabling gestures
  const gesturesDisabled = useSharedValue(false);
  // This value is used to indicate what is the current focus status
  const focusStatus = useSharedValue(FocusStatus.BLUR);
  const focusKey = useSharedValue<null | string>(null);

  // FOCUS & BLUR
  // Focus state
  const [focusState, setFocusState] = useState<FocusState | null>();
  // Blur state
  const [blurState, setBlurState] = useState<BlurState | null>();
  // Focus/Blur transition
  const transitionProgress = useSharedValue(1);
  const transitionStartPosition = useSharedValue<Vector>(vec(0, 0));
  const transitionStartScale = useSharedValue<number>(0);

  /**
   * EXPOSED FUNCTIONS
   */

  // Focus setter
  const startFocus = useCallback(
    (
      data: FocusData,
      animationSettings: Maybe<AnimationSettingsWithDefaults> = DEFAULT_FOCUS_ANIMATION_SETTINGS
    ) => {
      // Turn off animated reaction until data is completely set
      focusStatus.value = FocusStatus.FOCUS_PREPARATION;
      // Set focus data
      gesturesDisabled.value = data.gesturesDisabled;
      setFocusState({ animationSettings, data });

      // Disable auto sizing when focusing
      if (autoSizingContext) {
        autoSizingContext.disableAutoSizing();
      }
    },
    []
  );

  // Blur setter
  const endFocus = useCallback(
    (
      data?: Maybe<BlurData>,
      animationSettings: Maybe<AnimationSettingsWithDefaults> = DEFAULT_FOCUS_ANIMATION_SETTINGS
    ) => {
      // Do nothing if there is no focus applied
      if (focusStatus.value === FocusStatus.BLUR) {
        return;
      }
      // Turn off focus without animation if data is null
      if (data === null) {
        focusStatus.value = FocusStatus.BLUR;
        gesturesDisabled.value = false;
        focusKey.value = null;
        updateTransitionProgress(FocusStatus.BLUR, animationSettings);
      }
      // Set focus data if it is provided (to prepare for the transition)
      else if (data) {
        setBlurState({ animationSettings, data });
      }
      // Otherwise, just reset the container position
      else {
        handleContainerReset(animationSettings);
      }
    },
    []
  );

  /**
   * PRIVATE FUNCTIONS
   */
  const finishTransition = useCallback((finishStatus: FocusStatus) => {
    'worklet';
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

  const updateAnimationSettingsWithFinishCallback = useCallback(
    (
      animationSettings: AnimationSettingsWithDefaults,
      finishStatus: FocusStatus
    ) => {
      'worklet';
      const { onComplete, ...timingConfig } = animationSettings;
      return {
        ...timingConfig,
        onComplete: () => {
          'worklet';
          finishTransition(finishStatus);
          if (onComplete) {
            runOnJS(onComplete)();
          }
        }
      };
    },
    []
  );

  const updateTransitionProgress = useCallback(
    (
      finishStatus: FocusStatus,
      animationSettings: AnimationSettingsWithDefaults | null
    ) => {
      'worklet';
      if (animationSettings) {
        const { onComplete, ...timingConfig } =
          updateAnimationSettingsWithFinishCallback(
            animationSettings,
            finishStatus
          );
        transitionProgress.value = 0;
        transitionProgress.value = withTiming(1, timingConfig, onComplete);
      } else {
        finishTransition(finishStatus);
      }
    },
    []
  );

  const startTransition = useCallback(
    (
      key: null | string,
      transitionType:
        | FocusStatus.BLUR_TRANSITION
        | FocusStatus.FOCUS_TRANSITION,
      animationSettings: AnimationSettingsWithDefaults | null
    ) => {
      'worklet';
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
      updateTransitionProgress(finishStatus, animationSettings);
    },
    []
  );

  const handleContainerReset = useCallback(
    (animationSettings: AnimationSettingsWithDefaults | null) => {
      'worklet';
      focusStatus.value = FocusStatus.BLUR_TRANSITION;
      focusKey.value = null;
      updateTransitionProgress(FocusStatus.BLUR, animationSettings);
      // Reset the container position with animation if it is provided
      if (animationSettings) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { onComplete: _, ...timingConfig } = animationSettings;
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
      )
    }),
    ({ canvasRendered }) => {
      if (!focusState || !canvasRendered) return;
      startTransition(
        focusState.data.key,
        FocusStatus.FOCUS_TRANSITION,
        focusState.animationSettings
      );
      runOnJS(setBlurState)(null);
    },
    [focusState]
  );

  // This is used to start the blur transition
  useEffect(() => {
    if (!focusState || !blurState) return;
    startTransition(
      null,
      FocusStatus.BLUR_TRANSITION,
      blurState?.animationSettings ?? DEFAULT_FOCUS_ANIMATION_SETTINGS
    );
    runOnJS(setFocusState)(null);
  }, [blurState]);

  /**
   * ANIMATION HANDLERS
   */

  // Focus animation handler (from unfocused to focused state) and
  // translation when vertex moves
  useAnimatedReaction(
    () => {
      const status = focusStatus.value;
      if (
        (status !== FocusStatus.FOCUS_TRANSITION &&
          status !== FocusStatus.FOCUS) ||
        !focusState
      ) {
        return null;
      }

      const {
        centerPosition: { x, y },
        scale
      } = focusState.data;

      return {
        progress: transitionProgress.value,
        startPosition: transitionStartPosition.value,
        startScale: transitionStartScale.value,
        targetPosition: {
          x: canvasDimensions.width.value / 2 - x.value * scale.value,
          y: canvasDimensions.height.value / 2 - y.value * scale.value
        },
        targetScale: scale.value
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
      if (status !== FocusStatus.BLUR_TRANSITION || !blurState) {
        return null;
      }

      const { x, y } = blurState.data.translation;

      return {
        origin: blurState.data.origin,
        progress: transitionProgress.value,
        startPosition: transitionStartPosition.value,
        startScale: transitionStartScale.value,
        targetScale: initialScale,
        translation: {
          x: x.value,
          y: y.value
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
      endFocus,
      focusKey,
      focusStatus,
      focusTransitionProgress: transitionProgress,
      gesturesDisabled,
      startFocus
    }),
    []
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <FocusContext.Provider value={contextValue as any}>
      {children}
    </FocusContext.Provider>
  );
}

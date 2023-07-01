import { vec, Vector } from '@shopify/react-native-skia';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
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
  focusStatus: SharedValue<number>;
  gesturesDisabled: SharedValue<boolean>;
  startFocus: FocusStartSetter;
  transitionProgress: SharedValue<number>;
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
  const { resetContainerPosition, scaleContentTo, translateContentTo } =
    useTransformContext();
  // Auto sizing context values
  const autoSizingContext = useAutoSizingContext();

  // CONTEXT VALUES
  // Helper value for disabling gestures
  const gesturesDisabled = useSharedValue(false);
  // This value is used to indicate what is the current focus status
  const focusStatus = useSharedValue(FocusStatus.BLUR);

  // FOCUS & BLUR
  // Focus state
  const [focusState, setFocusState] = useState<FocusState | null>();
  // Blur state
  const [blurState, setBlurState] = useState<BlurState | null>();
  // Focus/Blur transition
  const transitionProgress = useSharedValue(0);
  const transitionStartPosition = useSharedValue<Vector>(vec(0, 0));
  const transitionStartScale = useSharedValue<number>(0);

  // HELPER VALUES
  const focusStartAnimationSettingsRef =
    useRef<AnimationSettingsWithDefaults | null>(null);

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
      focusStartAnimationSettingsRef.current = animationSettings;
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
      data?: BlurData,
      animSettings: Maybe<AnimationSettingsWithDefaults> = DEFAULT_FOCUS_ANIMATION_SETTINGS
    ) => {
      // Do nothing if there is no focus applied
      if (focusStatus.value === FocusStatus.BLUR) return;
      const animationSettings =
        animSettings ?? focusStartAnimationSettingsRef.current;
      // Set focus data if it is provided
      if (data) {
        setBlurState({ animationSettings, data });
      }
      // Otherwise, just reset the container position
      else {
        handleContainerReset(animSettings);
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
      focusStatus.value = finishStatus;
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

  const startTransition = useCallback(
    (
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
      // Update the transition progress
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

  const handleContainerReset = useCallback(
    (animationSettings: Maybe<AnimationSettingsWithDefaults>) => {
      'worklet';
      focusStatus.value = FocusStatus.BLUR_TRANSITION;
      // Reset the container position with animation if it is provided
      if (animationSettings) {
        resetContainerPosition({
          animationSettings: updateAnimationSettingsWithFinishCallback(
            animationSettings,
            FocusStatus.BLUR
          ),
          autoSizingContext
        });
      }
      // Otherwise, reset the container position without animation
      else {
        resetContainerPosition({ autoSizingContext });
        finishTransition(FocusStatus.BLUR);
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
        FocusStatus.FOCUS_TRANSITION,
        focusState.animationSettings
      );
      runOnJS(setBlurState)(null);
    },
    [focusState]
  );

  // This is used to start the blur transition
  useEffect(() => {
    if (!blurState) return;
    startTransition(FocusStatus.BLUR_TRANSITION, blurState.animationSettings);
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
      focusStatus,
      gesturesDisabled,
      startFocus,
      transitionProgress
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

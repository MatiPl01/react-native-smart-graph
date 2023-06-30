import { vec, Vector } from '@shopify/react-native-skia';
import {
  createContext,
  useCallback,
  useContext,
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
import { FocusData, FocusEndSetter, FocusStartSetter } from '@/types/focus';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { calcScaleOnProgress, calcTranslationOnProgress } from '@/utils/views';

import { useTransformContext } from './TransformProvider';

type FocusContextType = {
  endFocus: FocusEndSetter;
  focusStatus: SharedValue<number>;
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

type FocusProviderProps = {
  children?: React.ReactNode;
};

export default function FocusProvider({ children }: FocusProviderProps) {
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

  // HELPER VALUES
  const [focusState, setFocusState] = useState<FocusState | null>(null);
  const focusStartAnimationSettingsRef =
    useRef<AnimationSettingsWithDefaults | null>(null);
  // Focus transition
  const focusTransitionProgress = useSharedValue(0);
  const focusTransitionStartPosition = useSharedValue<Vector>(vec(0, 0));
  const focusTransitionStartScale = useSharedValue<number>(0);

  const startFocus = useCallback(
    (
      data: FocusData,
      animationSettings?: AnimationSettingsWithDefaults | null
    ) => {
      // Turn off animated reaction until data is completely set
      focusStatus.value = FocusStatus.FOCUS_PREPARATION;
      // Set focus data
      gesturesDisabled.value = data.gesturesDisabled;
      const animSettings = (focusStartAnimationSettingsRef.current =
        animationSettings === undefined
          ? DEFAULT_FOCUS_ANIMATION_SETTINGS
          : animationSettings);
      setFocusState({
        animationSettings: animSettings,
        data
      });

      // Disable auto sizing when focusing
      if (autoSizingContext) {
        autoSizingContext.disableAutoSizing();
      }
    },
    []
  );

  const endFocus = useCallback(
    (
      data?: {
        isPanning: SharedValue<boolean>;
        position: AnimatedVectorCoordinates;
      },
      animationSettings?: AnimationSettingsWithDefaults | null
    ) => {
      // TODO
    },
    []
  );

  const startFocusTransition = useCallback(
    (animationSettings: AnimationSettingsWithDefaults | null) => {
      'worklet';
      // Set initial values for the focus transition
      focusTransitionStartPosition.value = {
        x: currentTranslation.x.value,
        y: currentTranslation.y.value
      };
      focusTransitionStartScale.value = currentScale.value;
      // Turn on the animated reaction that will handle the focus animation
      focusStatus.value = FocusStatus.FOCUS_TRANSITION;
      // Update the focus transition progress
      if (animationSettings) {
        const { onComplete, ...timingConfig } = animationSettings;
        focusTransitionProgress.value = 0;
        focusTransitionProgress.value = withTiming(1, timingConfig, () => {
          'worklet';
          focusStatus.value = FocusStatus.FOCUS;
          if (onComplete) {
            runOnJS(onComplete)();
          }
        });
      } else {
        focusTransitionProgress.value = 1;
        focusStatus.value = FocusStatus.FOCUS;
      }
    },
    []
  );

  // This is used to handle focus animation on initial render
  useAnimatedReaction(
    () => ({
      canvasRendered: !!(
        canvasDimensions.width.value && canvasDimensions.height.value
      )
    }),
    ({ canvasRendered }) => {
      if (!canvasRendered || !focusState) return;
      startFocusTransition(focusState.animationSettings);
    },
    [focusState]
  );

  // Focus animation (from unfocused to focused state) and
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
        progress: focusTransitionProgress.value,
        startPosition: focusTransitionStartPosition.value,
        startScale: focusTransitionStartScale.value,
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

  const contextValue = useMemo<FocusContextType>(
    () => ({ endFocus, focusStatus, gesturesDisabled, startFocus }),
    []
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <FocusContext.Provider value={contextValue as any}>
      {children}
    </FocusContext.Provider>
  );
}

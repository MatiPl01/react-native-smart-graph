import { Vector } from '@shopify/react-native-skia';
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
import { useAutoSizingContext } from '@/providers/canvas/auto';
import { useCanvasDataContext } from '@/providers/canvas/data';
import {
  FocusData,
  FocusEndSetter,
  FocusStartSetter,
  PanGestureData
} from '@/types/focus';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { fixedWithDecay } from '@/utils/reanimated';
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

  // OTHER VALUES
  // Focused point data
  const [focusData, setFocusData] = useState<FocusData | null>(null);
  // Target translation position when blur animation is running
  // which was triggered by the user panning the canvas
  const [panGestureData, setPanGestureData] = useState<PanGestureData | null>(
    null
  );
  // Helper value for disabling gestures
  const gesturesDisabled = useSharedValue(false);
  // Helper values for focus animation
  // Used to check if the focus target has changed (to trigger focusStartTranslation
  // and focusStartScale to be set)
  const focusKey = useSharedValue<null | string>(null);
  const focusStartTranslation = useSharedValue<Vector | null>(null);
  const focusStartScale = useSharedValue(0);
  const focusTransitionProgress = useSharedValue(0);
  const focusStartAnimationSettingsRef =
    useRef<AnimationSettingsWithDefaults | null>(null);
  // This value is used to indicate whether the focus animation is running
  // or a vertex is being focused
  // 0 - not focusing
  // 1 - focusing
  // -1 - blurring
  const focusStatus = useSharedValue(1);
  const blurStartScale = useSharedValue(0);

  const startFocus = useCallback(
    (
      data: FocusData,
      animationSettings?: AnimationSettingsWithDefaults | null
    ) => {
      // Set the focus data
      focusStatus.value = 1;
      gesturesDisabled.value = data.gesturesDisabled;
      const animSettings =
        animationSettings === undefined
          ? DEFAULT_FOCUS_ANIMATION_SETTINGS
          : animationSettings;
      focusStartAnimationSettingsRef.current = animSettings;
      focusKey.value = `${data.centerPosition.x.value}${data.centerPosition.y.value}`;
      setFocusData(data);

      // Disable auto sizing when focusing
      if (autoSizingContext) {
        autoSizingContext.disableAutoSizing();
      }

      // Animate to the focus point's position and scale
      // if the animation settings are provided
      if (animSettings) {
        startProgressTransition(animSettings);
      }
      // Otherwise, set the progress to 1 to set the focus point's position
      // (change the scale immediately)
      else {
        focusTransitionProgress.value = 1;
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
      // Do nothing if is not focusing
      if (focusStatus.value !== 1) {
        return;
      }
      // Reset the focus data
      setFocusData(null);
      gesturesDisabled.value = false;
      focusStartTranslation.value = null;
      focusKey.value = null;
      blurStartScale.value = currentScale.value;
      const animSettings = createEndFocusAnimationSettings(animationSettings);
      // Change state to blurring if this FocusProvider will be used
      // to handle the blur animation
      focusStatus.value = data && animSettings ? -1 : 0;

      if (data) {
        setPanGestureData(data);

        if (animSettings) {
          startProgressTransition(animSettings);
        } else {
          focusTransitionProgress.value = 0;
        }
      }

      // Re-enable auto sizing if it was disabled
      if (data && autoSizingContext) {
        autoSizingContext.enableAutoSizingAfterTimeout(animSettings);
      }
      // Otherwise, if the auto sizing is not used, reset the
      // container position to default
      else {
        console.log('>>>', animSettings);
        resetContainerPosition({
          animationSettings: animSettings ?? undefined,
          autoSizing: autoSizingContext
            ? {
                disable: autoSizingContext.disableAutoSizing,
                enableAfterTimeout:
                  autoSizingContext.enableAutoSizingAfterTimeout
              }
            : undefined
        });
      }
    },
    []
  );

  const startProgressTransition = (
    animSettings: AnimationSettingsWithDefaults
  ) => {
    const { onComplete, ...timingConfig } = animSettings;
    focusTransitionProgress.value = 0;
    focusTransitionProgress.value = withTiming(1, timingConfig, onComplete);
  };

  const onBlurAnimationComplete = (onComplete?: () => void) => {
    focusStatus.value = 0;
    setPanGestureData(null);
    onComplete?.();

    const { x: clampX, y: clampY } = getTranslateClamp(currentScale.value);
    currentTranslation.x.value = fixedWithDecay(
      0,
      currentTranslation.x.value,
      clampX
    );
    currentTranslation.y.value = fixedWithDecay(
      0,
      currentTranslation.y.value,
      clampY
    );
  };

  const createEndFocusAnimationSettings = (
    animationSettings?: AnimationSettingsWithDefaults | null
  ): AnimationSettingsWithDefaults | null => {
    const animSettings =
      animationSettings === undefined
        ? // Use the animation settings that were passed to the startFocus
          // if animationSettings were not passed to the endFocus
          focusStartAnimationSettingsRef.current
        : animationSettings;

    if (!animSettings) return null;

    const { onComplete, ...timingConfig } = animSettings;
    return {
      ...timingConfig,
      onComplete: () => {
        'worklet';
        runOnJS(onBlurAnimationComplete)(onComplete);
      }
    };
  };

  useAnimatedReaction(
    () => ({
      canvasRendered: !!(
        canvasDimensions.width.value && canvasDimensions.height.value
      ),
      key: focusKey.value // This is used to trigger the reaction when the focus target changes
    }),
    ({ canvasRendered }) => {
      if (!canvasRendered) return;
      focusStartTranslation.value = {
        x: currentTranslation.x.value,
        y: currentTranslation.y.value
      };
      focusStartScale.value = currentScale.value;
    }
  );

  // Focus animation (from unfocused to focused state) and
  // translation when vertex moves
  useAnimatedReaction(
    () =>
      focusStatus.value === 1 && focusData && focusStartTranslation.value
        ? {
            finalScale: focusData.scale.value,
            finalTranslation: {
              x:
                canvasDimensions.width.value / 2 -
                focusData.centerPosition.x.value * focusData.scale.value,
              y:
                canvasDimensions.height.value / 2 -
                focusData.centerPosition.y.value * focusData.scale.value
            },
            startScale: focusStartScale.value,
            startTranslation: focusStartTranslation.value,
            transitionProgress: focusTransitionProgress.value
          }
        : null,
    data => {
      // Don't do anything if there is no data
      if (!data) return;
      console.log('focus reaction');
      const {
        finalScale,
        finalTranslation,
        startScale,
        startTranslation,
        transitionProgress
      } = data;
      // Scale the content to the focus scale
      scaleContentTo(
        calcScaleOnProgress(transitionProgress, startScale, finalScale)
      );
      // Translate the content to the focus position
      translateContentTo(
        calcTranslationOnProgress(
          transitionProgress,
          startTranslation,
          finalTranslation
        )
      );
    }
  );

  // Blur animation (from focused to unfocused state)
  // (when the user pans the canvas)
  useAnimatedReaction(
    () =>
      focusStatus.value === -1 && panGestureData && !focusData
        ? {
            finalScale: focusStartScale.value,
            gesturePosition: {
              x: panGestureData.position.x.value,
              y: panGestureData.position.y.value
            },
            isPanning: panGestureData.isPanning.value,
            startScale: blurStartScale.value,
            transitionProgress: focusTransitionProgress.value
          }
        : null,
    data => {
      // Don't do anything if there is no data
      if (!data) return;
      const {
        finalScale,
        gesturePosition: position,
        isPanning,
        startScale,
        transitionProgress
      } = data;
      console.log('blur reaction');
      // Scale the content to the previous scale before focusing
      scaleContentTo(
        calcScaleOnProgress(transitionProgress, startScale, finalScale),
        // Don't translate the content if the user is not panning
        // (the content will be translated automatically by the pan gesture)
        isPanning ? position : undefined,
        undefined,
        false
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

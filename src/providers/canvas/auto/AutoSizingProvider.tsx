import { Vector } from '@shopify/react-native-skia';
import { createContext, useContext, useMemo, useRef } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS } from '@/constants/animations';
import { useCanvasDataContext, useTransformContext } from '@/providers/canvas';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { Maybe } from '@/types/utils';
import {
  calcContainerTranslation,
  calcScaleOnProgress,
  calcTranslationOnProgress
} from '@/utils/views';

export type AutoSizingContextType = {
  autoSizingEnabled: SharedValue<boolean>;
  disableAutoSizing: () => void;
  enableAutoSizing: (
    animationSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => void;
  enableAutoSizingAfterTimeout: (
    animationSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => void;
};

const AutoSizingContext = createContext(null);

export const useAutoSizingContext = () => {
  const contextValue = useContext(AutoSizingContext);

  if (contextValue === null) {
    throw new Error(
      'useAutoSizingContext must be used within an AutoSizingProvider'
    );
  }

  return contextValue as AutoSizingContextType;
};

export default function AutoSizingProvider({
  children
}: {
  children?: React.ReactNode;
}) {
  // CONTEXT VALUES
  // Canvas data context values
  const {
    autoSizingEnabled,
    autoSizingTimeout,
    boundingRect: {
      bottom: containerBottom,
      left: containerLeft,
      right: containerRight,
      top: containerTop
    },
    canvasDimensions: { height: canvasHeight, width: canvasWidth },
    currentScale,
    currentTranslation: { x: translateX, y: translateY },
    objectFit,
    padding
  } = useCanvasDataContext();
  // Transform context values
  const { getIdealScale, scaleContentTo, translateContentTo } =
    useTransformContext();

  // OTHER VALUES
  const autoSizingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Transition between non-auto-layout and auto-layout states
  const autoSizingStartTranslation = useSharedValue<Vector>({ x: 0, y: 0 });
  const autoSizingStartScale = useSharedValue<number>(0);
  const autoSizingTransitionProgress = useSharedValue(1);

  const startAutoSizingTimeout = (
    animationSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => {
    autoSizingTimeoutRef.current = setTimeout(() => {
      enableAutoSizing(animationSettings);
    }, autoSizingTimeout.value);
  };

  const clearAutoSizingTimeout = () => {
    if (autoSizingTimeoutRef.current) {
      clearTimeout(autoSizingTimeoutRef.current);
      autoSizingTimeoutRef.current = null;
    }
  };

  const startAutoSizing = (
    animationSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => {
    autoSizingTimeoutRef.current = null;
    const animSettings =
      animationSettings === undefined
        ? DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS
        : animationSettings;
    // Crete a smooth transition between the current state and the auto-layout state
    if (animSettings) {
      const { onComplete, ...timingConfig } = animSettings;
      autoSizingTransitionProgress.value = 0;
      autoSizingTransitionProgress.value = withTiming(
        1,
        timingConfig,
        onComplete
      );
    }
    // Otherwise, if animationSettings is null, set the transition progress to 1 immediately
    else {
      autoSizingTransitionProgress.value = 1;
    }
    autoSizingStartScale.value = currentScale.value;
    autoSizingStartTranslation.value = {
      x: translateX.value,
      y: translateY.value
    };
  };

  const enableAutoSizingAfterTimeout = (
    animationSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => {
    'worklet';
    runOnJS(clearAutoSizingTimeout)();
    runOnJS(startAutoSizingTimeout)(animationSettings);
  };

  const enableAutoSizing = (
    animationSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => {
    'worklet';
    autoSizingEnabled.value = true;
    runOnJS(clearAutoSizingTimeout)();
    runOnJS(startAutoSizing)(animationSettings);
  };

  const disableAutoSizing = () => {
    'worklet';
    autoSizingEnabled.value = false;
    autoSizingTransitionProgress.value = 0;
    runOnJS(clearAutoSizingTimeout)();
  };

  useAnimatedReaction(
    () =>
      objectFit.value !== 'none' && autoSizingEnabled.value
        ? {
            boundingRect: {
              bottom: containerBottom.value,
              left: containerLeft.value,
              right: containerRight.value,
              top: containerTop.value
            },
            canvasDimensions: {
              height: canvasHeight.value,
              width: canvasWidth.value
            },
            startScale: autoSizingStartScale.value,
            startTranslation: autoSizingStartTranslation.value,
            transitionProgress: autoSizingTransitionProgress.value
          }
        : null,
    data => {
      if (!data) return;
      const {
        boundingRect,
        canvasDimensions,
        startScale,
        startTranslation,
        transitionProgress
      } = data;
      if (!startScale) return;
      // Scale content to fit container based on objectFit
      scaleContentTo(
        calcScaleOnProgress(
          transitionProgress,
          startScale,
          getIdealScale(boundingRect, canvasDimensions, objectFit.value)
        )
      );
      // Translate content to fit container based on objectFit
      translateContentTo(
        calcTranslationOnProgress(
          transitionProgress,
          startTranslation,
          calcContainerTranslation(
            boundingRect,
            canvasDimensions,
            padding.value
          )
        )
      );
    }
  );

  const contextValue = useMemo<AutoSizingContextType>(
    () => ({
      autoSizingEnabled,
      disableAutoSizing,
      enableAutoSizing,
      enableAutoSizingAfterTimeout
    }),
    []
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    <AutoSizingContext.Provider value={contextValue as any}>
      {children}
    </AutoSizingContext.Provider>
  );
}

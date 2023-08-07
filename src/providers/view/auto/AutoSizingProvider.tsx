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
import { useViewDataContext } from '@/providers/view/data';
import { useTransformContext } from '@/providers/view/transform';
import { AllAnimationSettings } from '@/types/settings';
import { Maybe } from '@/types/utils';

export type AutoSizingContextType = {
  autoSizingEnabled: SharedValue<boolean>;
  disableAutoSizing: () => void;
  enableAutoSizing: (animationSettings?: Maybe<AllAnimationSettings>) => void;
  enableAutoSizingAfterTimeout: (
    animationSettings?: Maybe<AllAnimationSettings>
  ) => void;
};

const AutoSizingContext = createContext(null as unknown as object);

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
  // OTHER CONTEXTS VALUES
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
  } = useViewDataContext();
  // Transform context values
  const { resetContainerPositionOnProgress } = useTransformContext();

  // OTHER VALUES
  const autoSizingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Transition between non-auto-layout and auto-layout states
  const autoSizingStartTranslation = useSharedValue<Vector>({ x: 0, y: 0 });
  const autoSizingStartScale = useSharedValue<number>(0);
  const autoSizingTransitionProgress = useSharedValue(1);

  const startAutoSizingTimeout = (
    animationSettings?: Maybe<AllAnimationSettings>
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

  const startAutoSizing = (animationSettings?: Maybe<AllAnimationSettings>) => {
    const animSettings =
      animationSettings === undefined
        ? DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS
        : animationSettings;
    autoSizingStartScale.value = currentScale.value;
    autoSizingStartTranslation.value = {
      x: translateX.value,
      y: translateY.value
    };
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
  };

  const enableAutoSizingAfterTimeout = (
    animationSettings?: Maybe<AllAnimationSettings>
  ) => {
    'worklet';
    if (objectFit.value === 'none') return;
    runOnJS(clearAutoSizingTimeout)();
    runOnJS(startAutoSizingTimeout)(animationSettings);
  };

  const enableAutoSizing = (
    animationSettings?: Maybe<AllAnimationSettings>
  ) => {
    'worklet';
    if (objectFit.value === 'none') return;
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
            // boundingRect and canvasDimensions must be used to trigger
            // the reaction when the canvas is resized or the container
            // bounding rect changes
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
            containerPadding: padding.value,
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
        containerPadding,
        startScale,
        startTranslation,
        transitionProgress
      } = data;
      if (!startScale) return;
      resetContainerPositionOnProgress(
        transitionProgress,
        startScale,
        startTranslation,
        {
          canvasDimensions,
          containerBoundingRect: boundingRect,
          padding: containerPadding
        }
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
    <AutoSizingContext.Provider value={contextValue}>
      {children}
    </AutoSizingContext.Provider>
  );
}

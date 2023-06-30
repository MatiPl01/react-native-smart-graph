import { Vector } from '@shopify/react-native-skia';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef
} from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS } from '@/constants/animations';
import { useCanvasDataContext, useTransformContext } from '@/providers/canvas';
import { BoundingRect } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { ObjectFit } from '@/types/views';
import {
  calcContainerScale,
  calcContainerTranslation,
  calcScaleOnProgress,
  calcTranslationOnProgress,
  clamp
} from '@/utils/views';

export type AutoSizingContextType = {
  disableAutoSizing: () => void;
  enableAutoSizing: (
    animationSettings?: AnimationSettingsWithDefaults | null
  ) => void;
  enableAutoSizingAfterTimeout: (
    animationSettings?: AnimationSettingsWithDefaults | null
  ) => void;
};

const AutoSizingContext = createContext(null);

export const useAutoSizingContext = () =>
  // The auto sizing context is optional, so we need to check if it exists
  // before using it (it is used only for specific objectFit values)
  useContext(AutoSizingContext) as AutoSizingContextType | null;

type AutoSizingProviderProps = PropsWithChildren<{
  autoSizingTimeout: number;
  maxScale: number;
  minScale: number;
  objectFit: ObjectFit;
  padding: BoundingRect;
}>;

export default function AutoSizingProvider({
  autoSizingTimeout,
  children,
  maxScale,
  minScale,
  objectFit,
  padding
}: AutoSizingProviderProps) {
  // CONTEXT VALUES
  // Canvas data context values
  const {
    autoSizingEnabled,
    boundingRect: {
      bottom: containerBottom,
      left: containerLeft,
      right: containerRight,
      top: containerTop
    },
    canvasDimensions: { height: canvasHeight, width: canvasWidth },
    currentScale,
    currentTranslation: { x: translateX, y: translateY }
  } = useCanvasDataContext();
  // Transform context values
  const { scaleContentTo, translateContentTo } = useTransformContext();

  // OTHER VALUES
  const autoSizingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Transition between non-auto-layout and auto-layout states
  const autoSizingStartTranslation = useSharedValue<Vector>({ x: 0, y: 0 });
  const autoSizingStartScale = useSharedValue<number>(0);
  const autoSizingTransitionProgress = useSharedValue(1);

  const startAutoSizingTimeout = (
    animationSettings?: AnimationSettingsWithDefaults | null
  ) => {
    autoSizingTimeoutRef.current = setTimeout(() => {
      enableAutoSizing(animationSettings);
    }, autoSizingTimeout);
  };

  const enableAutoSizingAfterTimeout = (
    animationSettings?: AnimationSettingsWithDefaults | null
  ) => {
    clearAutoSizingTimeout();
    startAutoSizingTimeout(animationSettings);
  };

  const enableAutoSizing = (
    animationSettings: AnimationSettingsWithDefaults | null = DEFAULT_AUTO_SIZING_ANIMATION_SETTINGS
  ) => {
    autoSizingTimeoutRef.current = null;
    // Crete a smooth transition between the current state and the auto-layout state
    if (animationSettings) {
      const { onComplete, ...timingConfig } = animationSettings;
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
    autoSizingEnabled.value = true;
  };

  const clearAutoSizingTimeout = () => {
    if (autoSizingTimeoutRef.current) {
      runOnJS(clearTimeout)(autoSizingTimeoutRef.current);
      autoSizingTimeoutRef.current = null;
    }
  };

  const disableAutoSizing = () => {
    autoSizingEnabled.value = false;
    autoSizingTransitionProgress.value = 0;
    clearAutoSizingTimeout();
  };

  useAnimatedReaction(
    () =>
      autoSizingEnabled.value
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
      // Scale content to fit container based on objectFit
      scaleContentTo(
        calcScaleOnProgress(
          transitionProgress,
          startScale,
          clamp(
            calcContainerScale(
              objectFit,
              {
                height: boundingRect.bottom - boundingRect.top,
                width: boundingRect.right - boundingRect.left
              },
              canvasDimensions,
              padding
            ),
            [minScale, maxScale]
          )
        )
      );
      // Translate content to fit container based on objectFit
      translateContentTo(
        calcTranslationOnProgress(
          transitionProgress,
          startTranslation,
          calcContainerTranslation(boundingRect, canvasDimensions, padding)
        )
      );
    },
    [objectFit]
  );

  const contextValue = useMemo<AutoSizingContextType>(
    () => ({
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

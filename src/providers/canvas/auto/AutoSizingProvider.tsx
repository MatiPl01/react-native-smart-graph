import { Vector } from '@shopify/react-native-skia';
import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import {
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import EASING from '@/constants/easings';
import { useCanvasDataContext } from '@/providers/canvas/data';
import { useTransformContext } from '@/providers/canvas/transform';
import { ObjectFit } from '@/types/views';
import {
  calcContainerScale,
  calcContainerTranslation,
  calcScaleOnProgress,
  calcTranslationOnProgress,
  clamp
} from '@/utils/views';

type AutoSizingContextType = {
  disableAutoSizing: () => void;
  enableAutoSizing: () => void;
  enableAutoSizingAfterTimeout: () => void;
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
}>;

export default function AutoSizingProvider({
  autoSizingTimeout,
  children,
  maxScale,
  minScale,
  objectFit
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

  const enableAutoSizingAfterTimeout = () => {
    clearAutoSizingTimeout();
    autoSizingTimeoutRef.current = setTimeout(
      enableAutoSizing,
      autoSizingTimeout
    );
  };

  const enableAutoSizing = () => {
    autoSizingTimeoutRef.current = null;
    autoSizingEnabled.value = true;
    autoSizingTransitionProgress.value = withTiming(1, {
      duration: 150,
      easing: EASING.ease
    });
    autoSizingStartScale.value = currentScale.value;
    autoSizingStartTranslation.value = {
      x: translateX.value,
      y: translateY.value
    };
  };

  const clearAutoSizingTimeout = () => {
    if (autoSizingTimeoutRef.current) {
      clearTimeout(autoSizingTimeoutRef.current);
      autoSizingTimeoutRef.current = null;
    }
  };

  const disableAutoSizing = () => {
    autoSizingEnabled.value = false;
    autoSizingTransitionProgress.value = withTiming(0, {
      duration: 150,
      easing: EASING.ease
    });
    clearAutoSizingTimeout();
  };

  useAnimatedReaction(
    () => ({
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
      enabled: autoSizingEnabled.value,
      startScale: autoSizingStartScale.value,
      startTranslation: autoSizingStartTranslation.value,
      transitionProgress: autoSizingTransitionProgress.value
    }),
    ({
      boundingRect,
      canvasDimensions,
      enabled,
      startScale,
      startTranslation,
      transitionProgress
    }) => {
      // Don't auto scale if it's disabled
      if (!enabled || objectFit === 'none') return;
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
              canvasDimensions
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
          calcContainerTranslation(objectFit, boundingRect, canvasDimensions)
        )
      );
    },
    [objectFit]
  );

  const contextValue: AutoSizingContextType = {
    disableAutoSizing,
    enableAutoSizing,
    enableAutoSizingAfterTimeout
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    <AutoSizingContext.Provider value={contextValue as any}>
      {children}
    </AutoSizingContext.Provider>
  );
}

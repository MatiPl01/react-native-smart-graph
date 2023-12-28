import { Vector } from '@shopify/react-native-skia';
import { createContext } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { AutoSizingContextType } from '@/providers/view/auto';
import { useViewDataContext } from '@/providers/view/data';
import { BoundingRect, Dimensions, ObjectFit } from '@/types/layout';
import { AllAnimationSettings } from '@/types/settings';
import { Maybe } from '@/types/utils';
import { useNullableContext } from '@/utils/contexts';
import {
  calcContainerScale,
  calcContainerTranslation,
  calcTranslationOnProgress,
  calcValueOnProgress,
  clamp
} from '@/utils/views';

export type TransformContextType = {
  getIdealScale: (
    boundingRect: BoundingRect,
    canvasDimensions: Dimensions,
    objFit: ObjectFit
  ) => number;
  getTranslateClamp: (scale: number) => {
    x: [number, number];
    y: [number, number];
  };
  handleCanvasRender: (event: LayoutChangeEvent) => void;
  handleGraphRender: (containerBoundingRect: BoundingRect) => void;
  resetContainerPosition: (settings?: {
    animationSettings?: Maybe<AllAnimationSettings>;
    autoSizingContext?: AutoSizingContextType;
    canvasDimensions?: Dimensions;
    containerBoundingRect?: BoundingRect;
    scale?: number;
  }) => void;
  resetContainerPositionOnProgress: (
    progress: number,
    startScale: number,
    startTranslation: Vector,
    settings?: {
      autoSizingContext?: AutoSizingContextType;
      canvasDimensions?: Dimensions;
      containerBoundingRect?: BoundingRect;
      padding?: BoundingRect;
      scale?: number;
    }
  ) => void;
  scaleContentTo: (
    newScale: number,
    origin?: Vector,
    animationSettings?: Maybe<AllAnimationSettings>,
    settings?: { callCallback?: boolean; withClamping?: boolean }
  ) => void;
  translateContentTo: (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animationSettings?: Maybe<AllAnimationSettings>,
    settings?: { callCallback?: boolean }
  ) => void;
};

const TransformContext = createContext<TransformContextType | null>(null);
TransformContext.displayName = 'TransformContext';

export const useTransformContext = () => useNullableContext(TransformContext);

export default function TransformProvider({
  children
}: {
  children?: React.ReactNode;
}) {
  // CONTEXTS
  // Canvas contexts
  const {
    boundingRect: {
      bottom: containerBottom,
      left: containerLeft,
      right: containerRight,
      top: containerTop
    },
    canvasDimensions: { height: canvasHeight, width: canvasWidth },
    currentScale,
    currentTranslation: { x: translateX, y: translateY },
    initialScale,
    isRendered,
    maxScale,
    minScale,
    objectFit,
    padding,
    targetBoundingRect
  } = useViewDataContext();

  // Other values
  const initialCanvasDimensions = useSharedValue<Dimensions | null>(null);
  const initialBoundingRect = useSharedValue<BoundingRect | null>(null);

  const handleCanvasRender = ({
    nativeEvent: {
      layout: { height, width }
    }
  }: LayoutChangeEvent) => {
    initialCanvasDimensions.value = { height, width };
  };

  const handleGraphRender = (containerBoundingRect: BoundingRect) => {
    'worklet';
    initialBoundingRect.value = containerBoundingRect;
    targetBoundingRect.value = containerBoundingRect;
  };

  const getCurrentBoundingRect = (): BoundingRect => {
    'worklet';
    return {
      bottom: containerBottom.value,
      left: containerLeft.value,
      right: containerRight.value,
      top: containerTop.value
    };
  };

  const getCurrentCanvasDimensions = (): Dimensions => {
    'worklet';
    return {
      height: canvasHeight.value,
      width: canvasWidth.value
    };
  };

  const getTranslateClamp = (
    scale: number
  ): {
    x: [number, number];
    y: [number, number];
  } => {
    'worklet';
    const leftLimit = (-containerLeft.value + padding.value.left) * scale;
    const rightLimit =
      canvasWidth.value - (containerRight.value + padding.value.right) * scale;
    const topLimit = (-containerTop.value + padding.value.top) * scale;
    const bottomLimit =
      canvasHeight.value -
      (containerBottom.value + padding.value.bottom) * scale;

    return {
      x: [Math.min(leftLimit, rightLimit), Math.max(rightLimit, leftLimit)],
      y: [Math.min(topLimit, bottomLimit), Math.max(bottomLimit, topLimit)]
    };
  };

  const getIdealScale = (
    boundingRect: BoundingRect,
    canvasDimensions: Dimensions,
    objFit: ObjectFit
  ) => {
    'worklet';
    return clamp(
      calcContainerScale(
        objFit,
        initialScale.value,
        {
          height: boundingRect.bottom - boundingRect.top,
          width: boundingRect.right - boundingRect.left
        },
        canvasDimensions,
        padding.value
      ),
      [minScale.value, maxScale.value]
    );
  };

  const translateContentTo = (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animationSettings?: Maybe<AllAnimationSettings>,
    settings?: { callCallback?: boolean }
  ) => {
    'worklet';
    const newTranslateX = clampTo?.x
      ? clamp(translate.x, clampTo.x)
      : translate.x;
    const newTranslateY = clampTo?.y
      ? clamp(translate.y, clampTo.y)
      : translate.y;

    if (animationSettings) {
      const { onComplete, ...timingConfig } = animationSettings;
      translateX.value = withTiming(newTranslateX, timingConfig);
      translateY.value = withTiming(
        newTranslateY,
        timingConfig,
        settings?.callCallback === false ? undefined : onComplete
      );
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    }
  };

  const scaleContentTo = (
    newScale: number,
    origin?: Vector,
    animationSettings?: Maybe<AllAnimationSettings>,
    settings?: { callCallback?: boolean; withClamping?: boolean }
  ) => {
    'worklet';
    if (origin && currentScale.value > 0) {
      const relativeScale = newScale / currentScale.value;
      translateContentTo(
        {
          x:
            translateX.value -
            (origin.x - translateX.value) * (relativeScale - 1),
          y:
            translateY.value -
            (origin.y - translateY.value) * (relativeScale - 1)
        },
        settings?.withClamping ? getTranslateClamp(newScale) : undefined,
        animationSettings,
        { callCallback: false }
      );
    }

    if (animationSettings) {
      const { onComplete, ...timingConfig } = animationSettings;
      currentScale.value = withTiming(
        newScale,
        timingConfig,
        settings?.callCallback === false ? undefined : onComplete
      );
    } else {
      currentScale.value = newScale;
    }
  };

  const resetContainerPosition = (settings?: {
    animationSettings?: Maybe<AllAnimationSettings>;
    autoSizingContext?: AutoSizingContextType;
    canvasDimensions?: Dimensions;
    containerBoundingRect?: BoundingRect;
    scale?: number;
  }) => {
    'worklet';
    const containerBoundingRect =
      settings?.containerBoundingRect ?? getCurrentBoundingRect();
    const canvasDimensions =
      settings?.canvasDimensions ?? getCurrentCanvasDimensions();

    // Disable auto sizing while resetting container position
    settings?.autoSizingContext?.disableAutoSizing();

    const scale =
      settings?.scale ??
      getIdealScale(containerBoundingRect, canvasDimensions, objectFit.value);

    scaleContentTo(scale, undefined, settings?.animationSettings);
    translateContentTo(
      calcContainerTranslation(
        containerBoundingRect,
        canvasDimensions,
        padding.value
      ),
      undefined,
      settings?.animationSettings,
      { callCallback: false }
    );

    // Enable auto sizing after resetting container position
    settings?.autoSizingContext?.enableAutoSizingAfterTimeout();
  };

  const resetContainerPositionOnProgress = (
    progress: number,
    startScale: number,
    startTranslation: Vector,
    settings?: {
      autoSizingContext?: AutoSizingContextType;
      canvasDimensions?: Dimensions;
      containerBoundingRect?: BoundingRect;
      padding?: BoundingRect;
      scale?: number;
    }
  ) => {
    'worklet';
    if (progress === 0) {
      settings?.autoSizingContext?.disableAutoSizing();
    }

    const containerBoundingRect =
      settings?.containerBoundingRect ?? getCurrentBoundingRect();
    const canvasDimensions =
      settings?.canvasDimensions ?? getCurrentCanvasDimensions();
    const targetScale =
      settings?.scale ??
      getIdealScale(containerBoundingRect, canvasDimensions, objectFit.value);

    // Scale content to fit container based on objectFit
    scaleContentTo(calcValueOnProgress(progress, startScale, targetScale));
    // Translate content to fit container based on objectFit
    translateContentTo(
      calcTranslationOnProgress(
        progress,
        startTranslation,
        calcContainerTranslation(
          containerBoundingRect,
          canvasDimensions,
          settings?.padding ?? padding.value
        )
      )
    );

    if (progress === 1) {
      settings?.autoSizingContext?.enableAutoSizingAfterTimeout();
    }
  };

  useAnimatedReaction(
    () => ({
      initialDimensions: initialCanvasDimensions.value,
      initialRect: initialBoundingRect.value
    }),
    ({ initialDimensions, initialRect }) => {
      if (!initialDimensions || !initialRect) {
        return;
      }
      // Translate container to the center
      resetContainerPosition({
        canvasDimensions: initialDimensions,
        containerBoundingRect: initialRect,
        scale: initialScale.value
      });
      isRendered.value = true;
      // Set canvas dimensions
      canvasWidth.value = initialDimensions.width;
      canvasHeight.value = initialDimensions.height;
    },
    [initialCanvasDimensions, initialBoundingRect]
  );

  const contextValue: TransformContextType = {
    getIdealScale,
    getTranslateClamp,
    handleCanvasRender,
    handleGraphRender,
    resetContainerPosition,
    resetContainerPositionOnProgress,
    scaleContentTo,
    translateContentTo
  };

  return (
    <TransformContext.Provider value={contextValue}>
      {children}
    </TransformContext.Provider>
  );
}

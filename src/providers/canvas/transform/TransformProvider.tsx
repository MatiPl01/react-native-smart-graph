import { Vector } from '@shopify/react-native-skia';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext
} from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import {
  AutoSizingContextType,
  useCanvasDataContext
} from '@/providers/canvas';
import { BoundingRect, Dimensions } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { Maybe } from '@/types/utils';
import { ObjectFit } from '@/types/views';
import {
  calcContainerScale,
  calcContainerTranslation,
  clamp
} from '@/utils/views';

type TransformContextType = {
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
    animationSettings?: Maybe<AnimationSettingsWithDefaults>;
    autoSizingContext: Maybe<AutoSizingContextType>;
    canvasDimensions?: Dimensions;
    containerBoundingRect?: BoundingRect;
    scale?: number;
  }) => void;
  scaleContentTo: (
    newScale: number,
    origin?: Vector,
    animationSettings?: Maybe<AnimationSettingsWithDefaults>,
    withClamping?: boolean
  ) => void;
  translateContentTo: (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animationSettings?: Maybe<AnimationSettingsWithDefaults>
  ) => void;
};

const TransformContext = createContext(null);

export const useTransformContext = () => {
  const contextValue = useContext(TransformContext);

  if (!contextValue) {
    throw new Error(
      'useTransformContext must be used within a TransformProvider'
    );
  }

  return contextValue as TransformContextType;
};

type TransformProviderProps = PropsWithChildren<{
  maxScale: number;
  minScale: number;
  objectFit: ObjectFit;
  padding: BoundingRect;
}>;

export default function TransformProvider({
  children,
  maxScale,
  minScale,
  objectFit,
  padding
}: TransformProviderProps) {
  // CONTEXT VALUES
  // Canvas data
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
    initialScale
  } = useCanvasDataContext();

  // Other values
  const initialCanvasDimensions = useSharedValue<Dimensions | null>(null);
  const initialBoundingRect = useSharedValue<BoundingRect | null>(null);

  const handleCanvasRender = useCallback(
    ({
      nativeEvent: {
        layout: { height, width }
      }
    }: LayoutChangeEvent) => {
      initialCanvasDimensions.value = { height, width };
    },
    []
  );

  const handleGraphRender = useCallback(
    (containerBoundingRect: BoundingRect) => {
      initialBoundingRect.value = containerBoundingRect;
    },
    []
  );

  const getTranslateClamp = (
    scale: number
  ): {
    x: [number, number];
    y: [number, number];
  } => {
    'worklet';

    const leftLimit = (-containerLeft.value + padding.left) * scale;
    const rightLimit =
      canvasWidth.value - (containerRight.value + padding.right) * scale;
    const topLimit = (-containerTop.value + padding.top) * scale;
    const bottomLimit =
      canvasHeight.value - (containerBottom.value + padding.bottom) * scale;

    return {
      x: [Math.min(leftLimit, rightLimit), Math.max(rightLimit, leftLimit)],
      y: [Math.min(topLimit, bottomLimit), Math.max(bottomLimit, topLimit)]
    };
  };

  const getIdealScale = useCallback(
    (
      boundingRect: BoundingRect,
      canvasDimensions: Dimensions,
      objFit: ObjectFit
    ) => {
      'worklet';
      return clamp(
        calcContainerScale(
          objFit,
          initialScale,
          {
            height: boundingRect.bottom - boundingRect.top,
            width: boundingRect.right - boundingRect.left
          },
          canvasDimensions,
          padding
        ),
        [minScale, maxScale]
      );
    },
    []
  );

  const translateContentTo = (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animationSettings?: Maybe<AnimationSettingsWithDefaults>
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
      translateY.value = withTiming(newTranslateY, timingConfig, onComplete);
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    }
  };

  const scaleContentTo = (
    newScale: number,
    origin?: Vector,
    animationSettings?: Maybe<AnimationSettingsWithDefaults>,
    withClamping = true
  ) => {
    'worklet';
    if (origin) {
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
        withClamping ? getTranslateClamp(newScale) : undefined,
        animationSettings && { ...animationSettings, onComplete: undefined }
      );
    }

    if (animationSettings) {
      const { onComplete, ...timingConfig } = animationSettings;
      currentScale.value = withTiming(newScale, timingConfig, onComplete);
    } else {
      currentScale.value = newScale;
    }
  };

  const resetContainerPosition = useCallback(
    (settings?: {
      animationSettings?: Maybe<AnimationSettingsWithDefaults>;
      autoSizingContext?: Maybe<AutoSizingContextType>;
      canvasDimensions?: Dimensions;
      containerBoundingRect?: BoundingRect;
      scale?: number;
    }) => {
      'worklet';
      const containerBoundingRect = settings?.containerBoundingRect ?? {
        bottom: containerBottom.value,
        left: containerLeft.value,
        right: containerRight.value,
        top: containerTop.value
      };

      const canvasDimensions = settings?.canvasDimensions ?? {
        height: canvasHeight.value,
        width: canvasWidth.value
      };

      // Disable auto sizing while resetting container position
      settings?.autoSizingContext?.disableAutoSizing();

      const scale =
        settings?.scale ??
        getIdealScale(containerBoundingRect, canvasDimensions, objectFit);

      scaleContentTo(scale, undefined, settings?.animationSettings);
      translateContentTo(
        calcContainerTranslation(
          containerBoundingRect,
          canvasDimensions,
          padding
        ),
        undefined,
        settings?.animationSettings && {
          ...settings.animationSettings,
          onComplete: undefined
        }
      );

      // Enable auto sizing after resetting container position
      settings?.autoSizingContext?.enableAutoSizingAfterTimeout();
    },
    [objectFit]
  );

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
        scale: initialScale
      });
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
    scaleContentTo,
    translateContentTo
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    <TransformContext.Provider value={contextValue as any}>
      {children}
    </TransformContext.Provider>
  );
}

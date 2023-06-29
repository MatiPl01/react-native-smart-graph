import { Vector } from '@shopify/react-native-skia';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef
} from 'react';
import { LayoutChangeEvent } from 'react-native';
import { runOnJS, withTiming } from 'react-native-reanimated';

import { useCanvasDataContext } from '@/providers/canvas/data';
import { BoundingRect, Dimensions } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { ObjectFit } from '@/types/views';
import {
  calcContainerScale,
  calcContainerTranslation,
  clamp
} from '@/utils/views';

type TransformContextType = {
  getTranslateClamp: (scale: number) => {
    x: [number, number];
    y: [number, number];
  };
  handleCanvasRender: (event: LayoutChangeEvent) => void;
  handleGraphRender: (containerBoundingRect: BoundingRect) => void;
  resetContainerPosition: (settings?: {
    animationSettings?: AnimationSettingsWithDefaults;
    autoSizing?: {
      disable: () => void;
      enableAfterTimeout: () => void;
    };
    canvasDimensions?: Dimensions;
    containerBoundingRect?: BoundingRect;
  }) => void;
  scaleContentTo: (
    newScale: number,
    origin?: Vector,
    animationSettings?: AnimationSettingsWithDefaults,
    withClamping?: boolean
  ) => void;
  translateContentTo: (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animationSettings?: AnimationSettingsWithDefaults
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
    currentTranslation: { x: translateX, y: translateY }
  } = useCanvasDataContext();

  // Other values
  const initialBoundingRectRef = useRef<BoundingRect | null>(null);

  const handleCanvasRender = useCallback(
    ({
      nativeEvent: {
        layout: { height, width }
      }
    }: LayoutChangeEvent) => {
      console.log('handleCanvasRender', { height, width });
      canvasWidth.value = width;
      canvasHeight.value = height;

      if (initialBoundingRectRef.current) {
        resetContainerPosition({
          canvasDimensions: {
            height,
            width
          },
          containerBoundingRect: initialBoundingRectRef.current
        });
      }
    },
    []
  );

  const handleGraphRender = useCallback(
    (containerBoundingRect: BoundingRect) => {
      console.log('handleGraphRender', containerBoundingRect);
      initialBoundingRectRef.current ??= containerBoundingRect;
      resetContainerPosition({
        containerBoundingRect
      });
    },
    []
  );

  const resetContainerPosition = useCallback(
    (settings?: {
      animationSettings?: AnimationSettingsWithDefaults;
      autoSizing?: {
        disable: () => void;
        enableAfterTimeout: () => void;
      };
      canvasDimensions?: Dimensions;
      containerBoundingRect?: BoundingRect;
    }) => {
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
      settings?.autoSizing?.disable();

      const scale = clamp(
        calcContainerScale(
          'contain',
          {
            height: containerBoundingRect.bottom - containerBoundingRect.top,
            width: containerBoundingRect.right - containerBoundingRect.left
          },
          canvasDimensions,
          padding
        ),
        [minScale, maxScale]
      );
      scaleContentTo(scale, undefined, settings?.animationSettings);
      translateContentTo(
        calcContainerTranslation(
          containerBoundingRect,
          canvasDimensions,
          padding
        ),
        undefined,
        settings?.animationSettings
      );

      // Enable auto sizing after resetting container position
      settings?.autoSizing?.enableAfterTimeout();
    },
    [objectFit]
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

  const translateContentTo = (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animationSettings?: AnimationSettingsWithDefaults
  ) => {
    'worklet';
    console.log('translateContentTo', translate, clampTo, animationSettings);

    const newTranslateX = clampTo?.x
      ? clamp(translate.x, clampTo.x)
      : translate.x;
    const newTranslateY = clampTo?.y
      ? clamp(translate.y, clampTo.y)
      : translate.y;

    if (animationSettings) {
      const { onComplete, ...timingConfig } = animationSettings;

      translateX.value = withTiming(newTranslateX, timingConfig);
      translateY.value = withTiming(newTranslateY, timingConfig, () => {
        'worklet';
        if (onComplete) runOnJS(onComplete)();
      });
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    }
  };

  const scaleContentTo = (
    newScale: number,
    origin?: Vector,
    animationSettings?: AnimationSettingsWithDefaults,
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
      const { onComplete, ...timingConfig } = animationSettings ?? {};

      currentScale.value = withTiming(
        newScale,
        timingConfig,
        onComplete &&
          (() => {
            runOnJS(onComplete)();
          })
      );
    } else {
      currentScale.value = newScale;
    }
  };

  const contextValue: TransformContextType = {
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

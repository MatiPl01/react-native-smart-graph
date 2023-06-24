import { Vector } from '@shopify/react-native-skia';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef
} from 'react';
import { LayoutChangeEvent } from 'react-native';
import { withTiming } from 'react-native-reanimated';

import EASING from '@/constants/easings';
import { useCanvasDataContext } from '@/providers/canvas/data';
import { BoundingRect, Dimensions } from '@/types/layout';
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
  resetContainerPosition: (
    settings?: {
      animated?: boolean;
      canvasDimensions?: Dimensions;
      containerBoundingRect?: BoundingRect;
    },
    userTriggered?: boolean
  ) => void;
  scaleContentTo: (
    newScale: number,
    origin?: Vector,
    animated?: boolean
  ) => void;
  translateContentTo: (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animated?: boolean
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
}>;

export default function TransformProvider({
  children,
  maxScale,
  minScale,
  objectFit
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
      canvasWidth.value = width;
      canvasHeight.value = height;

      if (initialBoundingRectRef.current) {
        resetContainerPosition(
          {
            canvasDimensions: {
              height,
              width
            },
            containerBoundingRect: initialBoundingRectRef.current
          },
          false
        );
      }
    },
    []
  );

  const handleGraphRender = useCallback(
    (containerBoundingRect: BoundingRect) => {
      initialBoundingRectRef.current ??= containerBoundingRect;
      resetContainerPosition(
        {
          containerBoundingRect
        },
        false
      );
    },
    []
  );

  const resetContainerPosition = useCallback(
    (
      settings?: {
        animated?: boolean;
        canvasDimensions?: Dimensions;
        containerBoundingRect?: BoundingRect;
      },
      userTriggered = true
    ) => {
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

      // if (userTriggered) disableAutoSizing(); // TODO

      const scale = clamp(
        calcContainerScale(
          'contain',
          {
            height: containerBoundingRect.bottom - containerBoundingRect.top,
            width: containerBoundingRect.right - containerBoundingRect.left
          },
          canvasDimensions
        ),
        [minScale, maxScale]
      );
      scaleContentTo(scale, undefined, settings?.animated);
      translateContentTo(
        calcContainerTranslation(
          objectFit,
          containerBoundingRect,
          canvasDimensions
        ),
        undefined,
        settings?.animated
      );

      // if (userTriggered) enableAutoSizingAfterTimeout(); // TODO
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

    return {
      x: [
        Math.min(
          -containerLeft.value * scale,
          canvasWidth.value - containerRight.value * scale
        ),
        Math.max(
          canvasWidth.value - containerRight.value * scale,
          -containerLeft.value * scale
        )
      ],
      y: [
        Math.min(
          -containerTop.value * scale,
          canvasHeight.value - containerBottom.value * scale
        ),
        Math.max(
          canvasHeight.value - containerBottom.value * scale,
          -containerTop.value * scale
        )
      ]
    };
  };

  const translateContentTo = (
    translate: Vector,
    clampTo?: { x?: [number, number]; y?: [number, number] },
    animated?: boolean
  ) => {
    'worklet';

    const newTranslateX = clampTo?.x
      ? clamp(translate.x, clampTo.x)
      : translate.x;
    const newTranslateY = clampTo?.y
      ? clamp(translate.y, clampTo.y)
      : translate.y;

    if (animated) {
      const timingConfig = { duration: 150, easing: EASING.ease };

      translateX.value = withTiming(newTranslateX, timingConfig);
      translateY.value = withTiming(newTranslateY, timingConfig);
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    }
  };

  const scaleContentTo = (
    newScale: number,
    origin?: Vector,
    animated = false
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
        getTranslateClamp(newScale),
        animated
      );
    }

    if (animated) {
      currentScale.value = withTiming(newScale, {
        duration: 150,
        easing: EASING.ease
      });
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

import { styled } from 'nativewind';
import { Children, PropsWithChildren, cloneElement, useCallback } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { Canvas, Group } from '@shopify/react-native-skia';

import ViewControls from '@/components/controls/ViewControls';
import { GraphComponentPrivateProps } from '@/components/graphs/GraphComponent';
import { Position } from '@/types/layout';
import { ObjectFit } from '@/types/views';
import { fixedWithDecay } from '@/utils/reanimated';
import { clamp, getCenterInParent, getScaleInParent } from '@/utils/views';

const StyledCanvas = styled(Canvas, 'grow');

type PannableScalableViewProps = PropsWithChildren<{
  minScale?: number; // default is auto (when the whole content is visible)
  maxScale?: number;
  objectFit?: ObjectFit;
  className?: string;
  controls?: boolean;
}>;

export default function PannableScalableView({
  minScale = 0.25, // TODO - improve scales
  maxScale = 10,
  objectFit = 'none',
  className,
  children,
  controls = false
}: PannableScalableViewProps) {
  // CANVAS
  const canvasWidth = useSharedValue(0);
  const canvasHeight = useSharedValue(0);

  // CONTAINER
  // Top-left corner
  const containerX1 = useSharedValue(0);
  const containerY1 = useSharedValue(0);
  // Bottom-right corner
  const containerX2 = useSharedValue(0);
  const containerY2 = useSharedValue(0);
  // Dimensions
  const containerWidth = useDerivedValue(
    () => containerX2.value - containerX1.value,
    [containerX1, containerX2]
  );
  const containerHeight = useDerivedValue(
    () => containerY2.value - containerY1.value,
    [containerY1, containerY2]
  );

  // CONTAINER SCALE
  const renderScale = useSharedValue(1);
  const currentScale = useSharedValue(1);
  const pinchStartScale = useSharedValue(1);

  // CONTAINER TRANSFORM
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const transform = useDerivedValue(
    () => [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: currentScale.value }
    ],
    [translateX, translateY, currentScale]
  );

  const handleCanvasRender = useCallback(
    ({
      nativeEvent: {
        layout: { width, height }
      }
    }: LayoutChangeEvent) => {
      canvasWidth.value = width;
      canvasHeight.value = height;
    },
    []
  );

  const resetContentPosition = useCallback(
    (animated?: boolean) => {
      const containerDimensions = {
        width: containerWidth.value,
        height: containerHeight.value
      };
      const canvasDimensions = {
        width: canvasWidth.value,
        height: canvasHeight.value
      };

      const { scale: renderedScale, dimensions: renderedDimensions } =
        getScaleInParent(objectFit, containerDimensions, canvasDimensions);

      renderScale.value = renderedScale;
      scaleContentTo(renderedScale, undefined, animated);

      const parentCenter = getCenterInParent(
        renderedDimensions,
        canvasDimensions
      );

      translateContentTo(
        {
          x: parentCenter.x - containerX1.value * renderedScale,
          y: parentCenter.y - containerY1.value * renderedScale
        },
        undefined,
        animated
      );
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
          -containerX1.value,
          -(containerWidth.value + containerX1.value) * scale +
            canvasWidth.value
        ),
        Math.max(
          canvasWidth.value - containerX2.value * scale,
          -containerX1.value * scale
        )
      ],
      y: [
        Math.min(
          -containerY1.value,
          -(containerHeight.value + containerY1.value) * scale +
            canvasHeight.value
        ),
        Math.max(
          canvasHeight.value - containerY2.value * scale,
          -containerY1.value * scale
        )
      ]
    };
  };

  const translateContentTo = (
    translate: Position,
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
      const timingConfig = { duration: 150, easing: Easing.ease };

      translateX.value = withTiming(newTranslateX, timingConfig);
      translateY.value = withTiming(newTranslateY, timingConfig);
    } else {
      translateX.value = newTranslateX;
      translateY.value = newTranslateY;
    }
  };

  const scaleContentTo = (
    newScale: number,
    origin?: Position,
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
        easing: Easing.ease
      });
    } else {
      currentScale.value = newScale;
    }
  };

  const panGestureHandler = Gesture.Pan()
    .onChange(e => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(({ velocityX, velocityY }) => {
      const { x: clampX, y: clampY } = getTranslateClamp(currentScale.value);
      translateX.value = fixedWithDecay(velocityX, translateX.value, clampX);
      translateY.value = fixedWithDecay(velocityY, translateY.value, clampY);
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = currentScale.value;
    })
    .onChange(e => {
      scaleContentTo(pinchStartScale.value * e.scale, {
        x: e.focalX,
        y: e.focalY
      });
    })
    .onEnd(e => {
      currentScale.value = fixedWithDecay(e.velocity, currentScale.value, [
        minScale,
        maxScale
      ]);
    });

  const tapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(({ x, y }) => {
      const origin = { x, y };
      const halfScale = (minScale + maxScale) / 2;

      if (currentScale.value < renderScale.value) {
        scaleContentTo(renderScale.value, origin, true);
      } else if (currentScale.value < halfScale) {
        scaleContentTo(halfScale, origin, true);
      } else if (currentScale.value < maxScale) {
        scaleContentTo(maxScale, origin, true);
      } else {
        scaleContentTo(renderScale.value, origin, true);
      }
    });

  return (
    <View className='grow relative overflow-hidden'>
      <GestureDetector
        gesture={Gesture.Race(
          Gesture.Simultaneous(pinchGestureHandler, panGestureHandler),
          tapGestureHandler
        )}>
        <StyledCanvas className={className} onLayout={handleCanvasRender}>
          <Group transform={transform}>
            {Children.map(children, child => {
              const childElement =
                child as React.ReactElement<GraphComponentPrivateProps>;
              return cloneElement(childElement, {
                boundingRect: {
                  x1: containerX1,
                  x2: containerX2,
                  y1: containerY1,
                  y2: containerY2
                }
              });
            })}
          </Group>
        </StyledCanvas>
      </GestureDetector>
      {controls && <ViewControls onReset={() => resetContentPosition(true)} />}
    </View>
  );
}

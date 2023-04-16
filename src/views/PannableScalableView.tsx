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
import { clamp, getScaleInParent } from '@/utils/views';

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
  const currentScale = useSharedValue(1);
  const pinchStartScale = useSharedValue(1);

  // CONTAINER TRANSFORM
  // Translation in percentage
  const relativeTranslateX = useSharedValue(0.5);
  const relativeTranslateY = useSharedValue(0.5);
  // Translation in pixels
  const absoluteTranslateX = useDerivedValue(
    () =>
      relativeTranslateX.value *
        (canvasWidth.value - containerWidth.value * currentScale.value) -
      containerX1.value * currentScale.value,
    [containerWidth, relativeTranslateX]
  );
  const absoluteTranslateY = useDerivedValue(
    () =>
      relativeTranslateY.value *
        (canvasHeight.value - containerHeight.value * currentScale.value) -
      containerY1.value * currentScale.value,
    [containerHeight, relativeTranslateY]
  );

  const transform = useDerivedValue(
    () => [
      { translateX: absoluteTranslateX.value },
      { translateY: absoluteTranslateY.value },
      { scale: currentScale.value }
    ],
    [absoluteTranslateX, absoluteTranslateY, currentScale]
  );

  const calcMaxTranslate = () => {
    'worklet';
    return {
      x: 1 + canvasWidth.value - containerWidth.value * currentScale.value,
      y: 1 + canvasHeight.value - containerHeight.value * currentScale.value
    };
  };

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

  const updateContentPosition = useCallback(
    (animated?: boolean) => {
      const renderedScale = getScaleInParent(
        objectFit,
        {
          width: containerWidth.value,
          height: containerHeight.value
        },
        {
          width: canvasWidth.value,
          height: canvasHeight.value
        }
      );

      const centerPosition = { x: 0.5, y: 0.5 };

      scaleContentTo(renderedScale, undefined, animated);
      translateContentTo(centerPosition, undefined, animated);
    },
    [objectFit]
  );

  const handleReset = useCallback(() => {
    updateContentPosition(true);
  }, []);

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

      relativeTranslateX.value = withTiming(newTranslateX, timingConfig);
      relativeTranslateY.value = withTiming(newTranslateY, timingConfig);
    } else {
      relativeTranslateX.value = newTranslateX;
      relativeTranslateY.value = newTranslateY;
    }
  };

  const scaleContentTo = (
    newScale: number,
    origin?: Position,
    animated = false
  ) => {
    'worklet';
    const clampedScale = clamp(newScale, [minScale, maxScale]);

    if (origin) {
      const relativeScale = clampedScale / currentScale.value;

      translateContentTo(
        {
          x:
            relativeTranslateX.value -
            (origin.x - relativeTranslateX.value) * (relativeScale - 1),
          y:
            relativeTranslateY.value -
            (origin.y - relativeTranslateY.value) * (relativeScale - 1)
        },
        {
          x: [0, 1],
          y: [0, 1]
        },
        animated
      );
    }

    if (animated) {
      currentScale.value = withTiming(clampedScale, {
        duration: 150,
        easing: Easing.ease
      });
    } else {
      currentScale.value = clampedScale;
    }
  };

  const panGestureHandler = Gesture.Pan()
    .onChange(e => {
      const maxTranslate = calcMaxTranslate();
      relativeTranslateX.value += e.changeX / maxTranslate.x;
      relativeTranslateY.value += e.changeY / maxTranslate.y;
    })
    .onEnd(({ velocityX, velocityY }) => {
      const maxTranslate = calcMaxTranslate();

      relativeTranslateX.value = fixedWithDecay(
        velocityX / maxTranslate.x,
        relativeTranslateX.value,
        [0, 1]
      );

      relativeTranslateY.value = fixedWithDecay(
        velocityY / maxTranslate.y,
        relativeTranslateY.value,
        [0, 1]
      );
    });

  const pinchGestureHandler = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = currentScale.value;
    })
    .onChange(e => {
      scaleContentTo(pinchStartScale.value * e.scale, {
        x: e.focalX / canvasWidth.value,
        y: e.focalY / canvasHeight.value
      });
    })
    .onEnd(e => {
      currentScale.value = fixedWithDecay(e.velocity, currentScale.value, [
        minScale,
        maxScale
      ]);
    });

  // const tapGestureHandler = Gesture.Tap()
  //   .numberOfTaps(2)
  //   .onEnd(({ x, y }) => {
  //     const origin = { x, y };
  //     const halfScale = (minScale + maxScale) / 2;

  //     if (scale.value < initialScale.value) {
  //       scaleContentTo(initialScale.value, origin, true);
  //     } else if (scale.value < halfScale) {
  //       scaleContentTo(halfScale, origin, true);
  //     } else if (scale.value < maxScale) {
  //       scaleContentTo(maxScale, origin, true);
  //     } else {
  //       scaleContentTo(initialScale.value, origin, true);
  //     }
  //   });

  return (
    <View className='grow relative overflow-hidden'>
      <GestureDetector
        gesture={Gesture.Race(
          Gesture.Simultaneous(pinchGestureHandler, panGestureHandler)
          // tapGestureHandler
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
      {controls && <ViewControls onReset={handleReset} />}
    </View>
  );
}

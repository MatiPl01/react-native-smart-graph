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

import { Canvas, Group, Vector } from '@shopify/react-native-skia';

import ViewControls from '@/components/controls/ViewControls';
import { GraphComponentPrivateProps } from '@/components/graphs/GraphComponent';
import { Dimensions } from '@/types/layout';
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
  const containerTop = useSharedValue(0);
  const containerLeft = useSharedValue(0);
  const containerRight = useSharedValue(0);
  const containerBottom = useSharedValue(0);
  // Dimensions
  const containerWidth = useDerivedValue(
    () => containerRight.value - containerLeft.value,
    [containerRight, containerLeft]
  );
  const containerHeight = useDerivedValue(
    () => containerBottom.value - containerTop.value,
    [containerBottom, containerTop]
  );

  // CONTAINER SCALE
  const renderScale = useSharedValue(1);
  const currentScale = useSharedValue(0.25);
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

      resetContentPosition({
        canvasDimensions: {
          width,
          height
        }
      });
    },
    []
  );

  const resetContentPosition = useCallback(
    (settings?: {
      containerDimensions?: Dimensions;
      canvasDimensions?: Dimensions;
      animated?: boolean;
    }) => {
      const containerDimensions = settings?.containerDimensions ?? {
        width: containerWidth.value,
        height: containerHeight.value
      };

      const canvasDimensions = settings?.canvasDimensions ?? {
        width: canvasWidth.value,
        height: canvasHeight.value
      };

      const { scale: renderedScale, dimensions: renderedDimensions } =
        getScaleInParent(objectFit, containerDimensions, canvasDimensions);

      renderScale.value = renderedScale;
      scaleContentTo(renderedScale, undefined, settings?.animated);

      const parentCenter = getCenterInParent(
        renderedDimensions,
        canvasDimensions
      );

      translateContentTo(
        {
          x: parentCenter.x - containerLeft.value * renderedScale,
          y: parentCenter.y - containerTop.value * renderedScale
        },
        undefined,
        settings?.animated
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
          -containerLeft.value,
          -(containerWidth.value + containerLeft.value) * scale +
            canvasWidth.value
        ),
        Math.max(
          canvasWidth.value - containerRight.value * scale,
          -containerLeft.value * scale
        )
      ],
      y: [
        Math.min(
          -containerTop.value,
          -(containerHeight.value + containerTop.value) * scale +
            canvasHeight.value
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
                  left: containerLeft,
                  right: containerRight,
                  top: containerTop,
                  bottom: containerBottom
                }
              });
            })}
          </Group>
        </StyledCanvas>
      </GestureDetector>
      {controls && (
        <ViewControls
          onReset={() => resetContentPosition({ animated: true })}
        />
      )}
    </View>
  );
}

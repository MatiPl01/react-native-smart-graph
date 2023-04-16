import { styled } from 'nativewind';
import {
  Children,
  PropsWithChildren,
  cloneElement,
  useCallback,
  useMemo
} from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withTiming
} from 'react-native-reanimated';

import { Canvas, Group } from '@shopify/react-native-skia';

import ViewControls from '@/components/controls/ViewControls';
import { GraphComponentPrivateProps } from '@/components/graphs/GraphComponent';
import { ObjectFit } from '@/types/views';
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

  // CONTAINER TRANSFORM
  // Translation in percentage
  const relativeTranslateX = useSharedValue(0.5);
  const relativeTranslateY = useSharedValue(0.5);
  // Translation in pixels
  const absoluteTranslateX = useDerivedValue(
    () =>
      relativeTranslateX.value * (canvasWidth.value - containerWidth.value) -
      containerX1.value,
    [containerWidth, relativeTranslateX]
  );
  const absoluteTranslateY = useDerivedValue(
    () =>
      relativeTranslateY.value * (canvasHeight.value - containerHeight.value) -
      containerY1.value,
    [containerHeight, relativeTranslateY]
  );

  // TODO - add scaling
  const initialScale = useSharedValue(0);
  const startScale = useSharedValue(0);
  const scale = useSharedValue(1);

  const transform = useDerivedValue(
    () => [
      { translateX: absoluteTranslateX.value },
      { translateY: absoluteTranslateY.value }
      // { scale: scale.value }
    ],
    [absoluteTranslateX, absoluteTranslateY, scale]
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

  // const updateContentPosition = useCallback(
  //   (animated?: boolean) => {
  //     const { scale: renderedScale, dimensions: renderedDimensions } =
  //       getScaleInParent(
  //         objectFit,
  //         {
  //           width: containerWidth.value,
  //           height: containerHeight.value
  //         },
  //         {
  //           width: canvasWidth.value,
  //           height: canvasHeight.value
  //         }
  //       );

  //     initialScale.value = renderedScale;
  //     scaleContentTo(renderedScale, undefined, animated);

  //     translateContentTo(
  //       getCenterInParent(renderedDimensions, {
  //         width: canvasWidth.value,
  //         height: canvasHeight.value
  //       }),
  //       undefined,
  //       animated
  //     );
  //   },
  //   [objectFit]
  // );

  const handleReset = useCallback(() => {
    // updateContentPosition(true);
  }, []);

  // const translateContentTo = (
  //   translate: Position,
  //   clampTo?: { x?: [number, number]; y?: [number, number] },
  //   animated?: boolean
  // ) => {
  //   'worklet';
  //   const timingConfig = { duration: 150, easing: Easing.ease };

  //   const newTranslateX = clampTo?.x
  //     ? clamp(translate.x, clampTo.x)
  //     : translate.x;
  //   const newTranslateY = clampTo?.y
  //     ? clamp(translate.y, clampTo.y)
  //     : translate.y;

  //   if (animated) {
  //     translateX.value = withTiming(newTranslateX, timingConfig);
  //     translateY.value = withTiming(newTranslateY, timingConfig);
  //   } else {
  //     translateX.value = newTranslateX;
  //     translateY.value = newTranslateY;
  //   }
  // };

  const translateWithDecay = (
    velocity: number,
    position: number,
    clampSize: number
  ) => {
    'worklet';
    let newVelocity = velocity;
    if (position < Math.min(0, clampSize) && velocity > 0) {
      newVelocity = -0.01;
    } else if (position > Math.max(0, clampSize) && velocity < 0) {
      newVelocity = 0.01;
    }

    return withDecay({
      velocity: newVelocity,
      clamp: [Math.min(0, clampSize), Math.max(0, clampSize)],
      rubberBandEffect: true,
      deceleration: 0.98,
      rubberBandFactor: 3
    });
  };

  // const scaleContentTo = (
  //   newScale: number,
  //   origin?: Position,
  //   animated = false
  // ) => {
  //   'worklet';
  //   const timingConfig = { duration: 150, easing: Easing.ease };
  //   const clampedScale = clamp(newScale, [minScale, maxScale]);

  //   if (origin) {
  //     const relativeScale = clampedScale / scale.value;

  //     const clampWidth =
  //       canvasWidth.value - containerWidth.value * clampedScale;
  //     const clampHeight =
  //       canvasHeight.value - containerHeight.value * clampedScale;

  //     translateContentTo(
  //       {
  //         x:
  //           translateX.value -
  //           (origin.x - translateX.value) * (relativeScale - 1),
  //         y:
  //           translateY.value -
  //           (origin.y - translateY.value) * (relativeScale - 1)
  //       },
  //       {
  //         x: [Math.min(0, clampWidth), Math.max(0, clampWidth)],
  //         y: [Math.min(0, clampHeight), Math.max(0, clampHeight)]
  //       },
  //       animated
  //     );
  //   }

  //   if (animated) {
  //     scale.value = withTiming(clampedScale, timingConfig);
  //   } else {
  //     scale.value = clampedScale;
  //   }
  // };

  const panGestureHandler = Gesture.Pan()
    .onChange(e => {
      relativeTranslateX.value +=
        e.changeX / (canvasWidth.value - containerWidth.value);
      relativeTranslateY.value +=
        e.changeY / (canvasHeight.value - containerHeight.value);
    })
    .onEnd(({ velocityX, velocityY }) => {
      const maxTranslateX = canvasWidth.value - containerWidth.value;
      relativeTranslateX.value = translateWithDecay(
        velocityX / maxTranslateX,
        relativeTranslateX.value,
        1 //scale.value
      );

      const maxTranslateY = canvasHeight.value - containerHeight.value;
      relativeTranslateY.value = translateWithDecay(
        velocityY / maxTranslateY,
        relativeTranslateY.value,
        1 //scale.value
      );
    });

  // const pinchGestureHandler = Gesture.Pinch()
  //   .onStart(() => {
  //     startScale.value = scale.value;
  //   })
  //   .onChange(e => {
  //     scaleContentTo(startScale.value * e.scale, { x: e.focalX, y: e.focalY });
  //   })
  //   .onEnd(e => {
  //     scale.value = withDecay({
  //       velocity: e.velocity,
  //       clamp: [minScale, maxScale],
  //       rubberBandEffect: true
  //     });
  //   });

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
          panGestureHandler
          // Gesture.Simultaneous(pinchGestureHandler, panGestureHandler),
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

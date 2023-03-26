import { styled } from 'nativewind';
import { Children, PropsWithChildren, cloneElement } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withTiming
} from 'react-native-reanimated';

import { Canvas, Group } from '@shopify/react-native-skia';

import { RenderEvent } from '../components/graphs/TestGraph';

const StyledCanvas = styled(Canvas, 'grow');

type PannableScalableViewProps = PropsWithChildren<{
  minScale?: number; // default is auto (when the whole content is visible)
  maxScale?: number;
  defaultScale?: number;
  className?: string;
}>;

export default function PannableScalableView({
  minScale = 0.25, // TODO
  maxScale = 10, // TODO
  defaultScale = 1, // TODO
  className,
  children
}: PannableScalableViewProps) {
  // TODO - use dimensions from props or calculate dimensions dynamically (render canvas with flex grow, then measure canvas dimensions)
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const graphWidth = useSharedValue(0);
  const graphHeight = useSharedValue(0);

  const startScale = useSharedValue(defaultScale);
  const scale = useSharedValue(defaultScale);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const transform = useDerivedValue(
    () => [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    [translateX, translateY, scale]
  );

  const clamp = (value: number, bounds: [number, number]) => {
    'worklet';
    return Math.min(Math.max(value, bounds[0]), bounds[1]);
  };

  const scaleContentTo = (
    newScale: number,
    origin?: { x: number; y: number },
    animated = true
  ) => {
    'worklet';
    const timingConfig = { duration: 150, easing: Easing.ease };
    const clampedScale = clamp(newScale, [minScale, maxScale]);

    if (origin) {
      const relativeScale = clampedScale / scale.value;
      const newTranslateX = clamp(
        translateX.value - (origin.x - translateX.value) * (relativeScale - 1),
        [
          Math.min(0, screenWidth - graphWidth.value * clampedScale),
          Math.max(0, screenWidth - graphWidth.value * clampedScale)
        ]
      );
      const newTranslateY = clamp(
        translateY.value - (origin.y - translateY.value) * (relativeScale - 1),
        [
          Math.min(0, screenHeight - graphHeight.value * clampedScale),
          Math.max(0, screenHeight - graphHeight.value * clampedScale)
        ]
      );

      if (animated) {
        translateX.value = withTiming(newTranslateX, timingConfig);
        translateY.value = withTiming(newTranslateY, timingConfig);
      } else {
        translateX.value = newTranslateX;
        translateY.value = newTranslateY;
      }
    }

    if (animated) {
      scale.value = withTiming(clampedScale, timingConfig);
    } else {
      scale.value = clampedScale;
    }
  };

  const panGesture = Gesture.Pan()
    .onChange(e => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(e => {
      translateX.value = withDecay({
        velocity: e.velocityX,
        clamp: [
          Math.min(0, screenWidth - graphWidth.value * scale.value),
          Math.max(0, screenWidth - graphWidth.value * scale.value)
        ],
        rubberBandEffect: true
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        clamp: [
          Math.min(0, screenHeight - graphHeight.value * scale.value),
          Math.max(0, screenHeight - graphHeight.value * scale.value)
        ],
        rubberBandEffect: true
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onChange(e => {
      scaleContentTo(
        startScale.value * e.scale,
        { x: e.focalX, y: e.focalY },
        false
      );
    })
    .onEnd(e => {
      scale.value = withDecay({
        velocity: e.velocity,
        clamp: [minScale, maxScale],
        rubberBandEffect: true
      });
    });

  const tapGestureHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(({ x, y }) => {
      const origin = { x, y };
      const halfScale = (maxScale + minScale) / 2;

      if (scale.value < defaultScale) {
        scaleContentTo(defaultScale, origin);
      } else if (scale.value < halfScale) {
        scaleContentTo(halfScale, origin);
      } else if (scale.value < maxScale) {
        scaleContentTo(maxScale, origin);
      } else {
        scaleContentTo(defaultScale, origin);
      }
    });

  return (
    <GestureDetector
      gesture={Gesture.Race(
        Gesture.Simultaneous(pinchGesture, panGesture),
        tapGestureHandler
      )}>
      <StyledCanvas className={className}>
        <Group transform={transform}>
          {Children.map(children, child => {
            const childElement = child as React.ReactElement;
            return cloneElement(childElement, {
              onRender: ({ layout }: RenderEvent) => {
                graphWidth.value = layout.width.value;
                graphHeight.value = layout.height.value;
              }
            });
          })}
        </Group>
      </StyledCanvas>
    </GestureDetector>
  );
}

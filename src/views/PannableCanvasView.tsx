import { styled } from 'nativewind';
import { PropsWithChildren } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useDerivedValue,
  useSharedValue,
  withDecay
} from 'react-native-reanimated';

import { Canvas, Circle, Group } from '@shopify/react-native-skia';

const StyledCanvas = styled(Canvas, 'grow');

type PannableCanvasViewProps = PropsWithChildren<{
  minScale?: number; // default is auto (when the whole content is visible)
  maxScale?: number;
  className?: string;
}>;

export default function PannableCanvasView({
  minScale,
  maxScale,
  className,
  children
}: PannableCanvasViewProps) {
  const { height, width } = useWindowDimensions();

  const scale = useSharedValue(1);
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
  const translateYTransform = useDerivedValue(
    () => [{ translateY: translateY.value }],
    [translateY]
  );

  const panGesture = Gesture.Pan()
    .onChange(e => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
      console.log(e.changeX, e.changeY, translateY.value);
    })
    .onEnd(e => {
      translateX.value = withDecay({
        velocity: e.velocityX,
        clamp: [0, width]
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        clamp: [0, height]
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(e => {
      console.log('pinch start');
    })
    .onChange(e => {
      console.log('pinch active');
    })
    .onEnd(e => {
      console.log('pinch end');
    });

  const tapGestureHandler = Gesture.Tap()
    .onStart(e => {
      console.log('tap start');
    })
    .onEnd(e => {
      console.log('tap end');
    });

  return (
    <GestureDetector
      gesture={Gesture.Race(pinchGesture, tapGestureHandler, panGesture)}>
      <StyledCanvas className={className}>
        <Group transform={transform}>
          {children}
          <Circle cx={50} cy={50} r={50} color='yellow' />
        </Group>
      </StyledCanvas>
    </GestureDetector>
  );
}

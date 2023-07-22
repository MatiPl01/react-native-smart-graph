import { memo, useRef } from 'react';
import { Pressable } from 'react-native';
// eslint-disable-next-line import/default
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import { VertexComponentData } from '@/types/components';
import {
  AnimatedBoundingRect,
  AnimatedVectorCoordinates
} from '@/types/layout';
import { VertexPressHandler } from '@/types/settings/graph/events';

const LONG_PRESS_ANIMATION_DURATION = 500;
const LONG_PRESS_DELAY = 300;

const PULSE_DURATION = 200;

const PRESS_MAX_SCALE = 1.3;
const LONG_PRESS_MAX_SCALE = 1.15;

const pulseAnimation = (activeScale: number): number => {
  'worklet';
  return withSequence(
    withTiming(activeScale, { duration: PULSE_DURATION / 2 }),
    withTiming(1, { duration: PULSE_DURATION / 2 })
  );
};

type VertexOverlayProps<V, E> = {
  boundingRect: AnimatedBoundingRect;
  data: VertexComponentData<V, E>;
  debug?: boolean;
  onLongPress?: VertexPressHandler<V>;
  onPress?: VertexPressHandler<V>;
  position: AnimatedVectorCoordinates;
  radius: SharedValue<number>;
  scale: SharedValue<number>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function OverlayVertex<V, E>({
  boundingRect,
  data: { vertex },
  debug,
  onLongPress,
  onPress,
  position,
  radius,
  scale
}: VertexOverlayProps<V, E>) {
  // HELPER VALUES
  const isPressing = useSharedValue(false);
  const longPressStarted = useSharedValue(false);
  const longPressAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getPressEventData = () => ({
    position,
    vertex: {
      key: vertex.key,
      value: vertex.value
    }
  });

  // PRESS EVENT
  const handlePress = () => {
    // Don't trigger the press event if the long press has started
    if (longPressStarted.value) return;
    // Animate the vertex and trigger the press event
    scale.value = pulseAnimation(PRESS_MAX_SCALE);

    onPress?.(getPressEventData());
  };

  // LONG PRESS EVENT
  const clearLongPressTimeout = () => {
    if (longPressAnimationTimeoutRef.current) {
      clearTimeout(longPressAnimationTimeoutRef.current);
      longPressAnimationTimeoutRef.current = null;
    }
  };

  const handlePressIn = () => {
    if (!onLongPress) return;
    // Reset state
    clearLongPressTimeout();
    isPressing.value = true;
    longPressStarted.value = false;

    // Set timeout to start long press animation
    longPressAnimationTimeoutRef.current = setTimeout(() => {
      // Check if the user has released the press before the timeout
      if (!isPressing.value) return;
      // Start long press animation
      longPressStarted.value = true;
      scale.value = withTiming(LONG_PRESS_MAX_SCALE, {
        duration: LONG_PRESS_ANIMATION_DURATION
      });
    }, LONG_PRESS_DELAY);
  };

  const handlePressOut = () => {
    if (!onLongPress) return;
    // Reset state
    clearLongPressTimeout();
    isPressing.value = false;
    longPressAnimationTimeoutRef.current = null;

    // Check if the long press animation has started
    if (longPressStarted.value) {
      // If so, trigger the long press event and reset the scale
      onLongPress?.(getPressEventData());
      scale.value = withTiming(1, { duration: PULSE_DURATION / 2 }, () => {
        longPressStarted.value = false;
      });
    }
  };

  const style = useAnimatedStyle(() => {
    const size = 2 * radius.value;

    return {
      height: size,
      transform: [
        {
          translateX: position.x.value - boundingRect.left.value - radius.value
        },
        { translateY: position.y.value - boundingRect.top.value - radius.value }
      ] as never[], // this is a fix wor incorrectly inferred types,
      width: size
    };
  }, [position.x, position.y, radius]);

  return (
    <AnimatedPressable
      style={[
        style,
        {
          position: 'absolute',
          ...(debug ? { backgroundColor: '#cc8c01' } : {})
        }
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    />
  );
}

export default memo(OverlayVertex) as typeof OverlayVertex;

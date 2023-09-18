import { memo, useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import { VertexComponentData, VertexData } from '@/types/data';
import { AnimatedBoundingRect } from '@/types/layout';
import {
  InternalPressEventsSettings,
  InternalVertexSettings
} from '@/types/settings';
import { getVertexPosition } from '@/utils/transform';

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

type VertexOverlayProps<V> = {
  boundingRect: AnimatedBoundingRect;
  debug?: boolean;
  pressSettings: InternalPressEventsSettings<V>;
  vertexData: VertexComponentData<V>;
  vertexSettings: InternalVertexSettings;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function OverlayVertex<V>({
  boundingRect,
  debug,
  pressSettings: {
    disableAnimation: animationDisabled,
    onVertexLongPress: onLongPress,
    onVertexPress: onPress
  },
  vertexData,
  vertexSettings: { radius }
}: VertexOverlayProps<V>) {
  const { key, scale, value } = vertexData;
  // HELPER VALUES
  const isPressing = useSharedValue(false);
  const longPressStarted = useSharedValue(false);
  const longPressAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getPressEventData = () => ({
    vertex: { key, value } as unknown as VertexData<V>
  });

  // PRESS EVENT
  const handlePress = () => {
    isPressing.value = false;
    if (!onPress) return;
    // Don't trigger the press event if the long press has started
    if (longPressStarted.value) return;
    onPress(getPressEventData());
    // Don't animate if the animation is disabled
    if (animationDisabled.value) return;

    // Animate the vertex and trigger the press event
    scale.value = pulseAnimation(PRESS_MAX_SCALE);
  };

  const resetScale = () => {
    // Animate if the animation is not disabled
    if (!animationDisabled) {
      scale.value = withTiming(1, { duration: PULSE_DURATION / 2 }, () => {
        longPressStarted.value = false;
      });
    }
  };

  const handleLongPress = () => {
    if (!isPressing.value) return;
    // If so, trigger the long press event and reset the scale
    onLongPress?.(getPressEventData());
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

      // Animate if the animation is not disabled
      if (!animationDisabled) {
        scale.value = withTiming(
          LONG_PRESS_MAX_SCALE,
          {
            duration: LONG_PRESS_ANIMATION_DURATION
          },
          completed => {
            if (completed) runOnJS(handleLongPress)();
          }
        );
      }
    }, LONG_PRESS_DELAY);
  };

  const handlePressOut = () => {
    if (!onLongPress) return;
    // Reset scale if the long press has not started
    if (longPressStarted.value) resetScale();
    // Reset state
    clearLongPressTimeout();
    isPressing.value = false;
    longPressAnimationTimeoutRef.current = null;
  };

  const style = useAnimatedStyle(() => {
    const r = radius * scale.value;
    const size = 2 * r;
    const position = getVertexPosition(vertexData);

    return {
      height: size,
      transform: [
        { translateX: position.x - boundingRect.left.value - r },
        { translateY: position.y - boundingRect.top.value - r }
      ] as Array<never>, // this is a fix wor incorrectly inferred types,
      width: size
    };
  }, [vertexData, radius]);

  useEffect(() => {
    return () => {
      handlePressOut();
    };
  }, []);

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

import { memo, useMemo } from 'react';
import { Pressable } from 'react-native';
// eslint-disable-next-line import/default
import Animated, {
  SharedValue,
  useAnimatedStyle
} from 'react-native-reanimated';

import { VertexComponentData } from '@/types/components';
import {
  AnimatedBoundingRect,
  AnimatedVectorCoordinates
} from '@/types/layout';
import { VertexPressHandler } from '@/types/settings/graph/events';

type VertexOverlayProps<V, E> = {
  boundingRect: AnimatedBoundingRect;
  data: VertexComponentData<V, E>;
  onLongPress?: VertexPressHandler<V>;
  onPress?: VertexPressHandler<V>;
  position: AnimatedVectorCoordinates;
  radius: SharedValue<number>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function OverlayVertex<V, E>({
  boundingRect,
  data: { vertex },
  onLongPress,
  onPress,
  position,
  radius
}: VertexOverlayProps<V, E>) {
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

  const pressEventData = useMemo(
    () => ({
      position,
      vertex: {
        key: vertex.key,
        value: vertex.value
      }
    }),
    []
  );

  const handlePress = () => {
    onPress?.(pressEventData);
  };

  const handleLongPress = () => {
    onLongPress?.(pressEventData);
  };

  return (
    <AnimatedPressable
      onLongPress={handleLongPress}
      onPress={handlePress}
      style={[{ position: 'absolute' }, style]}
    />
  );
}

export default memo(OverlayVertex) as typeof OverlayVertex;

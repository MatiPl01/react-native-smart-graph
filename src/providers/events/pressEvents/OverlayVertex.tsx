import { memo } from 'react';
import { Pressable } from 'react-native';
// eslint-disable-next-line import/default
import Animated, {
  SharedValue,
  useAnimatedStyle
} from 'react-native-reanimated';

import {
  AnimatedBoundingRect,
  AnimatedVectorCoordinates
} from '@/types/layout';
import { VertexPressHandler } from '@/types/settings/graph/events';

type VertexOverlayProps<V> = {
  boundingRect: AnimatedBoundingRect;
  onLongPress?: VertexPressHandler<V>;
  onPress?: VertexPressHandler<V>;
  position: AnimatedVectorCoordinates;
  radius: SharedValue<number>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function OverlayVertex<V>({
  boundingRect,
  onLongPress,
  onPress,
  position,
  radius
}: VertexOverlayProps<V>) {
  const style = useAnimatedStyle(() => {
    const size = 2 * radius.value;

    return {
      height: size,
      transform: [
        {
          translateX: position.x.value - boundingRect.left.value - radius.value
        },
        { translateY: position.y.value - boundingRect.top.value - radius.value }
      ],
      width: size
    };
  }, [position.x, position.y, radius]);

  const handlePress = () => {
    // TODO
    console.log('handlePress');
  };

  const handleLongPress = () => {
    // TODO
    console.log('handleLongPress');
  };

  return (
    <AnimatedPressable
      onLongPress={handleLongPress}
      onPress={handlePress}
      style={[{ backgroundColor: 'red', position: 'absolute' }, style]}
    />
  );
}

export default memo(OverlayVertex) as typeof OverlayVertex;

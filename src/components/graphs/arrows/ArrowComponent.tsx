import { Group, Transforms2d } from '@shopify/react-native-skia';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { ArrowComponentProps } from '@/types/components';
import { translateAlongVector } from '@/utils/vectors';

export default function ArrowComponent({
  animationProgress,
  renderer,
  transform: arrowTransform,
  vertexRadius
}: ArrowComponentProps) {
  // RENDERER PROPS
  const rendererProps = {
    animationProgress,
    edgeRotation: useSharedValue(0),
    s: vertexRadius,
    scale: useSharedValue(0)
  };

  // HELPER VALUES
  const transform = useSharedValue<Transforms2d>([{ scale: 0 }]);

  useAnimatedReaction(
    () => arrowTransform.value,
    ({ dirVector, scale, tipPosition }) => {
      const center = translateAlongVector(
        tipPosition,
        dirVector,
        -(scale * vertexRadius) / 2
      );
      const rotation = Math.atan2(dirVector.y, dirVector.x);

      transform.value = [
        { translateX: center.x },
        { translateY: center.y },
        { rotate: rotation },
        { scale }
      ];
      rendererProps.edgeRotation.value = rotation;
      rendererProps.scale.value = scale;
    },
    [vertexRadius]
  );

  return <Group transform={transform}>{renderer(rendererProps)}</Group>;
}

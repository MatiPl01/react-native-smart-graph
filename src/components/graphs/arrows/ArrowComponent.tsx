import { Group, Transforms2d } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { ArrowComponentProps } from '@/types/components';
import { translateAlongVector } from '@/utils/vectors';

function ArrowComponent({
  animationProgress,
  renderer,
  transform: arrowTransform
}: ArrowComponentProps) {
  // RENDERER PROPS
  const rendererProps = {
    animationProgress,
    edgeRotation: useSharedValue(0),
    scale: useSharedValue(0),
    vertexRadius: useSharedValue(0)
  };

  // HELPER VALUES
  const transform = useSharedValue<Transforms2d>([{ scale: 0 }]);

  useAnimatedReaction(
    () => arrowTransform.value,
    ({ dirVector, scale, tipPosition, vertexRadius }) => {
      const center = translateAlongVector(
        tipPosition,
        dirVector,
        -(scale * vertexRadius)
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
      rendererProps.vertexRadius.value = vertexRadius;
    }
  );

  return <Group transform={transform}>{renderer(rendererProps)}</Group>;
}

export default memo(ArrowComponent);

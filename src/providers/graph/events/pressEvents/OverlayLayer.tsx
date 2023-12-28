import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { VertexComponentData } from '@/types/data';
import { AnimatedBoundingRect, AnimatedTransformation } from '@/types/layout';
import {
  InternalPressEventsSettings,
  InternalVertexSettings
} from '@/types/settings';

import OverlayVertex from './OverlayVertex';

type OverlayLayerProps<V> = {
  boundingRect: AnimatedBoundingRect;
  debug?: boolean;
  pressSettings: InternalPressEventsSettings<V>;
  transform: AnimatedTransformation;
  vertexSettings: InternalVertexSettings;
  verticesData: Record<string, VertexComponentData<V>>;
};

export default function OverlayLayer<V>({
  boundingRect,
  debug,
  pressSettings,
  transform,
  vertexSettings,
  verticesData
}: OverlayLayerProps<V>) {
  const style = useAnimatedStyle(() => {
    const boundingLeft = boundingRect.left.value;
    const boundingTop = boundingRect.top.value;

    const width = boundingRect.right.value - boundingLeft;
    const height = boundingRect.bottom.value - boundingTop;
    const scale = transform.scale.value;

    // Translation between the center of the container and the
    // center of the graph
    const dx = (width / 2 + boundingLeft) * (scale - 1);
    const dy = (height / 2 + boundingTop) * (scale - 1);

    return {
      height,
      transform: [
        { translateX: transform.translateX.value + boundingLeft + dx },
        { translateY: transform.translateY.value + boundingTop + dy },
        { scale }
      ] as Array<never>, // this is a fix for incorrectly inferred types
      width
    };
  });

  return (
    <>
      <Animated.View
        style={[
          style,
          {
            position: 'absolute',
            ...(debug ? { backgroundColor: 'rgba(255, 183, 0, 0.2)' } : {})
          }
        ]}>
        {Object.entries(verticesData).map(
          ([key, data]) =>
            !data.removed && (
              <OverlayVertex<V>
                boundingRect={boundingRect}
                debug={debug}
                key={key}
                pressSettings={pressSettings}
                vertexData={data}
                vertexSettings={vertexSettings}
              />
            )
        )}
      </Animated.View>
    </>
  );
}

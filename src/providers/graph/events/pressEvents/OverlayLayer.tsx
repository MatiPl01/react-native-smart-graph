import React from 'react';
// eslint-disable-next-line import/default
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedCanvasTransform } from '@/types/canvas';
import {
  VertexComponentData,
  VertexComponentRenderData
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { AnimatedBoundingRect } from '@/types/layout';
import { GraphEventsSettings } from '@/types/settings';

import OverlayVertex from './OverlayVertex';

type OverlayLayerProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  boundingRect: AnimatedBoundingRect;
  debug?: boolean;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphEventsSettings<V, E, ED>;
  transform: AnimatedCanvasTransform;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

export default function OverlayLayer<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  boundingRect,
  debug = true,
  renderedVerticesData,
  settings,
  transform,
  verticesData
}: OverlayLayerProps<V, E, ED>) {
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
      ] as never[], // this is a fix for incorrectly inferred types
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
        {(settings?.onVertexPress || settings?.onVertexLongPress) &&
          Object.entries(renderedVerticesData).map(
            ([key, { currentRadius, position, scale }]) => {
              const data = verticesData[key];

              if (!data) {
                return null;
              }

              return (
                <OverlayVertex<V, E>
                  boundingRect={boundingRect}
                  data={data}
                  debug={debug}
                  key={key}
                  onLongPress={settings?.onVertexLongPress}
                  onPress={settings?.onVertexPress}
                  position={position}
                  radius={currentRadius}
                  scale={scale}
                />
              );
            }
          )}
      </Animated.View>
    </>
  );
}

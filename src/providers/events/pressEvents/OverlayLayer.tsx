import React from 'react';
// eslint-disable-next-line import/default
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedCanvasTransform } from '@/types/canvas';
import { VertexComponentRenderData } from '@/types/components';
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
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphEventsSettings<V, E, ED>;
  transform: AnimatedCanvasTransform;
};

export default function OverlayLayer<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  boundingRect,
  renderedVerticesData,
  settings,
  transform
}: OverlayLayerProps<V, E, ED>) {
  const style = useAnimatedStyle(() => ({
    height: boundingRect.bottom.value - boundingRect.top.value,
    transform: [
      { translateX: transform.translateX.value + boundingRect.left.value },
      { translateY: transform.translateY.value + boundingRect.top.value },
      { scale: transform.scale.value }
    ],
    width: boundingRect.right.value - boundingRect.left.value
  }));

  return (
    <Animated.View
      style={[style, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
      {(settings?.onVertexPress || settings?.onVertexLongPress) &&
        Object.entries(renderedVerticesData).map(
          ([key, { currentRadius, position }]) => (
            <OverlayVertex
              boundingRect={boundingRect}
              key={key}
              onLongPress={settings?.onVertexLongPress}
              onPress={settings?.onVertexPress}
              position={position}
              radius={currentRadius}
            />
          )
        )}
    </Animated.View>
  );
}

import { memo, useEffect } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedPositionCoordinates,
  Position
} from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import { GraphVertexSettings } from '@/types/settings';

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  settings: Required<GraphVertexSettings>;
  placementPosition: Position;
  containerBoundingRect: AnimatedBoundingRect;
  boundingVertices: Record<keyof AnimatedBoundingRect, string | null>;
  renderer: VertexRenderFunction<V>;
  setAnimatedPosition: (
    key: string,
    position: AnimatedPositionCoordinates
  ) => void;
};

function VertexComponent<V, E>({
  vertex,
  settings,
  placementPosition,
  containerBoundingRect,
  boundingVertices,
  renderer,
  setAnimatedPosition
}: VertexComponentProps<V, E>) {
  const x = useSharedValue(placementPosition.x);
  const y = useSharedValue(placementPosition.y);

  const key = vertex.key;

  useEffect(() => {
    x.value = placementPosition.x;
    y.value = placementPosition.y;

    setAnimatedPosition(vertex.key, { x, y });
  }, [vertex.key, placementPosition]);

  useAnimatedReaction(
    () => ({
      x1: x.value - settings.radius,
      x2: x.value + settings.radius
    }),
    ({ x1, x2 }) => {
      if (boundingVertices.x1 === key || x1 <= containerBoundingRect.x1.value) {
        containerBoundingRect.x1.value = x1;
        boundingVertices.x1 = key;
      }
      if (boundingVertices.x2 === key || x2 >= containerBoundingRect.x2.value) {
        containerBoundingRect.x2.value = x2;
        boundingVertices.x2 = key;
      }
    },
    [x]
  );

  useAnimatedReaction(
    () => ({
      y1: y.value - settings.radius,
      y2: y.value + settings.radius
    }),
    ({ y1, y2 }) => {
      if (boundingVertices.y1 === key || y1 <= containerBoundingRect.y1.value) {
        containerBoundingRect.y1.value = y1;
        boundingVertices.y1 = key;
      }
      if (boundingVertices.y2 === key || y2 >= containerBoundingRect.y2.value) {
        containerBoundingRect.y2.value = y2;
        boundingVertices.y2 = key;
      }
    },
    [y]
  );

  return renderer({
    key: vertex.key,
    data: vertex.value,
    radius: settings.radius,
    position: { x, y }
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;

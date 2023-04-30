import { memo, useEffect } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedBoundingVertices,
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
  boundingVertices: AnimatedBoundingVertices;
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
      if (
        x1 <= containerBoundingRect.left.value ||
        boundingVertices.left.value === key
      ) {
        containerBoundingRect.left.value = x1;
        boundingVertices.left.value = key;
      }
      if (
        x2 >= containerBoundingRect.right.value ||
        boundingVertices.right.value === key
      ) {
        containerBoundingRect.right.value = x2;
        boundingVertices.right.value = key;
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
      if (
        y1 <= containerBoundingRect.top.value ||
        boundingVertices.top.value === key
      ) {
        containerBoundingRect.top.value = y1;
        boundingVertices.top.value = key;
      }
      if (
        y2 >= containerBoundingRect.bottom.value ||
        boundingVertices.bottom.value === key
      ) {
        containerBoundingRect.bottom.value = y2;
        boundingVertices.bottom.value = key;
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

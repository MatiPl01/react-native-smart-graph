import { memo, useCallback, useEffect } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { Vector } from '@shopify/react-native-skia';

import { Vertex } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedBoundingVertices,
  AnimatedVectorCoordinates
} from '@/types/layout';
import { VertexRenderFunction } from '@/types/renderer';
import { GraphVertexSettings } from '@/types/settings';

type AnimatedPositionSetter = (
  key: string,
  position: AnimatedVectorCoordinates | null
) => void;

type VertexComponentProps<V, E> = {
  vertex: Vertex<V, E>;
  settings: Required<GraphVertexSettings>;
  containerBoundingRect: AnimatedBoundingRect;
  boundingVertices: AnimatedBoundingVertices;
  renderer: VertexRenderFunction<V>;
  setAnimatedPosition: AnimatedPositionSetter;
  setAnimatedPlacementPosition: AnimatedPositionSetter;
};

function VertexComponent<V, E>({
  vertex,
  settings,
  containerBoundingRect,
  boundingVertices,
  renderer,
  setAnimatedPosition,
  setAnimatedPlacementPosition
}: VertexComponentProps<V, E>) {
  const renderX =
    containerBoundingRect.left.value + containerBoundingRect.right.value / 2;
  const renderY =
    containerBoundingRect.top.value + containerBoundingRect.bottom.value / 2;

  const x = useSharedValue(renderX);
  const y = useSharedValue(renderY);

  const placementX = useSharedValue(renderX);
  const placementY = useSharedValue(renderY);

  const key = vertex.key;

  useEffect(() => {
    // Add vertex to animated positions if it's added to the graph
    setAnimatedPosition(vertex.key, { x, y });
    setAnimatedPlacementPosition(vertex.key, { x: placementX, y: placementY });

    // Remove vertex from bounding vertices if it's removed from the graph
    return () => {
      if (boundingVertices.left.value === key) {
        boundingVertices.left.value = null;
      }
      if (boundingVertices.right.value === key) {
        boundingVertices.right.value = null;
      }
      if (boundingVertices.top.value === key) {
        boundingVertices.top.value = null;
      }
      if (boundingVertices.bottom.value === key) {
        boundingVertices.bottom.value = null;
      }

      // Remove vertex from animated positions if it's removed from the graph
      setAnimatedPosition(vertex.key, null);
      setAnimatedPlacementPosition(vertex.key, null);
    };
  }, [vertex.key]);

  // Update bounding vertices if vertex x position coordinate was changed
  useAnimatedReaction(
    () => ({
      x1: x.value - settings.radius,
      x2: x.value + settings.radius
    }),
    ({ x1, x2 }) => {
      if (
        x1 < containerBoundingRect.left.value ||
        boundingVertices.left.value === key ||
        !boundingVertices.left.value
      ) {
        containerBoundingRect.left.value = x1;
        boundingVertices.left.value = key;
      }
      if (
        x2 > containerBoundingRect.right.value ||
        boundingVertices.right.value === key ||
        !boundingVertices.right.value
      ) {
        containerBoundingRect.right.value = x2;
        boundingVertices.right.value = key;
      }
    },
    [x]
  );

  // Update bounding vertices if vertex y position coordinate was changed
  useAnimatedReaction(
    () => ({
      y1: y.value - settings.radius,
      y2: y.value + settings.radius
    }),
    ({ y1, y2 }) => {
      if (
        y1 < containerBoundingRect.top.value ||
        boundingVertices.top.value === key ||
        !boundingVertices.top.value
      ) {
        containerBoundingRect.top.value = y1;
        boundingVertices.top.value = key;
      }
      if (
        y2 > containerBoundingRect.bottom.value ||
        boundingVertices.bottom.value === key ||
        !boundingVertices.bottom.value
      ) {
        containerBoundingRect.bottom.value = y2;
        boundingVertices.bottom.value = key;
      }
    },
    [y]
  );

  const renderVertex = useCallback(
    () =>
      renderer({
        key: vertex.key,
        data: vertex.value,
        radius: settings.radius,
        position: { x, y }
      }),
    [vertex]
  );

  // Render the vertex component
  return renderVertex();
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;

import { memo, useEffect } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

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
  boundingVertices: AnimatedBoundingVertices;
  containerBoundingRect: AnimatedBoundingRect;
  verticesPositions: {
    readonly [key: string]: AnimatedVectorCoordinates;
  };
  renderer: VertexRenderFunction<V>;
  setAnimatedPosition: AnimatedPositionSetter;
  setAnimatedPlacementPosition: AnimatedPositionSetter;
};

function VertexComponent<V, E>({
  vertex,
  settings,
  boundingVertices,
  containerBoundingRect,
  verticesPositions,
  renderer,
  setAnimatedPosition,
  setAnimatedPlacementPosition
}: VertexComponentProps<V, E>) {
  const key = vertex.key;
  const renderX =
    containerBoundingRect.left.value + containerBoundingRect.right.value / 2;
  const renderY =
    containerBoundingRect.top.value + containerBoundingRect.bottom.value / 2;

  // Current vertex position
  const x = useSharedValue(renderX);
  const y = useSharedValue(renderY);

  // Vertex placement position
  const placementX = useSharedValue(renderX);
  const placementY = useSharedValue(renderY);

  // Previous bounding vertices (replaced by the current vertex)
  const previousTopVertexKey = useSharedValue<string | null>(null);
  const previousBottomVertexKey = useSharedValue<string | null>(null);
  const previousLeftVertexKey = useSharedValue<string | null>(null);
  const previousRightVertexKey = useSharedValue<string | null>(null);

  useEffect(() => {
    // Add vertex to animated positions if it's added to the graph
    setAnimatedPosition(vertex.key, { x, y });
    setAnimatedPlacementPosition(vertex.key, { x: placementX, y: placementY });

    // if (
    //   !boundingVertices.left.value ||
    //   x.value - settings.radius < containerBoundingRect.left.value
    // ) {
    //   boundingVertices.left.value = key;
    //   containerBoundingRect.left.value = x.value - settings.radius;
    // }

    // if (
    //   !boundingVertices.right.value ||
    //   x.value + settings.radius > containerBoundingRect.right.value
    // ) {
    //   boundingVertices.right.value = key;
    //   containerBoundingRect.right.value = x.value + settings.radius;
    // }

    // if (
    //   !boundingVertices.top.value ||
    //   y.value - settings.radius < containerBoundingRect.top.value
    // ) {
    //   boundingVertices.top.value = key;
    //   containerBoundingRect.top.value = y.value - settings.radius - 100;
    // }

    // if (
    //   !boundingVertices.bottom.value ||
    //   y.value + settings.radius > containerBoundingRect.bottom.value
    // ) {
    //   boundingVertices.bottom.value = key;
    //   containerBoundingRect.bottom.value = y.value + settings.radius;
    // }

    return () => {
      // Remove vertex from animated positions if it's removed from the graph
      setAnimatedPosition(vertex.key, null);
      setAnimatedPlacementPosition(vertex.key, null);
    };
  }, [key]);

  // Update bounding vertices if vertex x position coordinate was changed
  useAnimatedReaction(
    () => ({
      x1: x.value - settings.radius,
      x2: x.value + settings.radius
    }),
    ({ x1, x2 }) => {
      const container = {
        left: containerBoundingRect.left.value,
        right: containerBoundingRect.right.value
      };
      const previousContainer = {
        left:
          (previousLeftVertexKey.value &&
            verticesPositions[previousLeftVertexKey.value]?.x.value) ||
          null,
        right:
          (previousRightVertexKey.value &&
            verticesPositions[previousRightVertexKey.value]?.x.value) ||
          null
      };
      const vertices = {
        left: boundingVertices.left.value,
        right: boundingVertices.right.value
      };
      const previousVertices = {
        left: previousLeftVertexKey.value,
        right: previousRightVertexKey.value
      };

      // If the current vertex is outside the left boundary of the container or there
      // is no leftmost vertex
      if (x1 <= container.left || !vertices.left) {
        containerBoundingRect.left.value = x1;
        // If the current vertex has just become the leftmost vertex
        if (vertices.left !== key) {
          // Update the leftmost bounding vertex
          boundingVertices.left.value = key;
          // Store the previous leftmost bounding vertex and its position
          previousLeftVertexKey.value = vertices.left;
        }
        // If the current vertex is not outside the left boundary of the container
        // but it's the leftmost vertex
      } else if (vertices.left === key) {
        // Check if the previous leftmost vertex is outside the left boundary of the
        // container
        if (previousContainer.left && previousContainer.left < container.left) {
          // Update the leftmost bounding vertex and its position
          boundingVertices.left.value = previousVertices.left;
          containerBoundingRect.left.value = previousContainer.left;
          // Store the current leftmost bounding vertex as the previous one
          previousLeftVertexKey.value = key;
        } else {
          // Otherwise, update the leftmost bounding vertex position
          containerBoundingRect.left.value = x1;
        }
      }

      // If the current vertex is outside the right boundary of the container or
      // there is no rightmost vertex
      if (x2 >= container.right || !vertices.right) {
        containerBoundingRect.right.value = x2;
        // If the current vertex has just become the rightmost vertex
        if (vertices.right !== key) {
          // Update the rightmost bounding vertex
          boundingVertices.right.value = key;
          // Store the previous rightmost bounding vertex and its position
          previousRightVertexKey.value = vertices.right;
        }
        // If the current vertex is not outside the right boundary of the container
        // but it's the rightmost vertex
      } else if (vertices.right === key) {
        // Check if the previous rightmost vertex is outside the right boundary of
        // the container
        if (
          previousContainer.right &&
          previousContainer.right > container.right
        ) {
          // Update the rightmost bounding vertex and its position
          boundingVertices.right.value = previousVertices.right;
          containerBoundingRect.right.value = previousContainer.right;
          // Store the current rightmost bounding vertex as the previous one
          previousRightVertexKey.value = key;
        } else {
          // Otherwise, update the rightmost bounding vertex position
          containerBoundingRect.right.value = x2;
        }
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
      const container = {
        top: containerBoundingRect.top.value,
        bottom: containerBoundingRect.bottom.value
      };
      const previousContainer = {
        top:
          (previousTopVertexKey.value &&
            verticesPositions[previousTopVertexKey.value]?.y.value) ||
          null,
        bottom:
          (previousBottomVertexKey.value &&
            verticesPositions[previousBottomVertexKey.value]?.y.value) ||
          null
      };
      const vertices = {
        top: boundingVertices.top.value,
        bottom: boundingVertices.bottom.value
      };
      const previousVertices = {
        top: previousTopVertexKey.value,
        bottom: previousBottomVertexKey.value
      };

      // If the current vertex is outside the top boundary of the container or there is
      // no topmost vertex
      if (y1 <= container.top || !vertices.top) {
        containerBoundingRect.top.value = y1;
        // If the current vertex has just become the topmost vertex
        if (vertices.top !== key) {
          // Update the topmost bounding vertex
          boundingVertices.top.value = key;
          // Store the previous topmost bounding vertex and its position
          previousTopVertexKey.value = vertices.top;
        }
        // If the current vertex is not outside the top boundary of the container but
        // it's the topmost vertex
      } else if (vertices.top === key) {
        // Check if the previous topmost vertex is outside the top boundary of the
        // container
        if (previousContainer.top && previousContainer.top < container.top) {
          // Update the topmost bounding vertex and its position
          boundingVertices.top.value = previousVertices.top;
          containerBoundingRect.top.value = previousContainer.top;
          // Store the current topmost bounding vertex as the previous one
          previousTopVertexKey.value = key;
        } else {
          // Otherwise, update the topmost bounding vertex position
          containerBoundingRect.top.value = y1;
        }
      }

      // If the current vertex is outside the bottom boundary of the container or
      // there is no bottommost vertex
      if (y2 >= container.bottom || !vertices.bottom) {
        containerBoundingRect.bottom.value = y2;
        // If the current vertex has just become the bottommost vertex
        if (vertices.bottom !== key) {
          // Update the bottommost bounding vertex
          boundingVertices.bottom.value = key;
          // Store the previous bottommost bounding vertex and its position
          previousBottomVertexKey.value = vertices.bottom;
        }
        // If the current vertex is not outside the bottom boundary of the container
        // but it's the bottommost vertex
      } else if (vertices.bottom === key) {
        // Check if the previous bottommost vertex is outside the bottom boundary of
        // the container
        if (
          previousContainer.bottom &&
          previousContainer.bottom > container.bottom
        ) {
          // Update the bottommost bounding vertex and its position
          boundingVertices.bottom.value = previousVertices.bottom;
          containerBoundingRect.bottom.value = previousContainer.bottom;
          // Store the current bottommost bounding vertex as the previous one
          previousBottomVertexKey.value = key;
        } else {
          // Otherwise, update the bottommost bounding vertex position
          containerBoundingRect.bottom.value = y2;
        }
      }
    },
    [y]
  );

  // Render the vertex component
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

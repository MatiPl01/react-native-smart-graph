import { memo, useEffect } from 'react';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { Vertex } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedVectorCoordinates,
  RelativeVerticesOrder
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
  relativeHorizontalOrder: SharedValue<RelativeVerticesOrder>;
  relativeVerticalOrder: SharedValue<RelativeVerticesOrder>;
  containerBoundingRect: AnimatedBoundingRect;
  renderer: VertexRenderFunction<V>;
  setAnimatedPosition: AnimatedPositionSetter;
  setAnimatedPlacementPosition: AnimatedPositionSetter;
};

function VertexComponent<V, E>({
  vertex,
  settings,
  relativeHorizontalOrder,
  relativeVerticalOrder,
  containerBoundingRect,
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
  const positionX = useSharedValue(renderX);
  const positionY = useSharedValue(renderY);

  // Vertex placement position
  const placementX = useSharedValue(renderX);
  const placementY = useSharedValue(renderY);

  useEffect(() => {
    // Add vertex to animated positions if it's added to the graph
    setAnimatedPosition(vertex.key, { x: positionX, y: positionY });
    setAnimatedPlacementPosition(vertex.key, { x: placementX, y: placementY });

    return () => {
      // Update bounding vertices if the current vertex is the bounding vertex
      // If the current vertex is the left bounding vertex
      if (!relativeHorizontalOrder.value[vertex.key]?.prev) {
        const nextLeftKey = relativeHorizontalOrder.value[vertex.key]?.next;
        const nextLeftPosition =
          relativeHorizontalOrder.value[nextLeftKey || '']?.position;
        if (nextLeftPosition) {
          containerBoundingRect.left.value = nextLeftPosition - settings.radius;
        }
      }
      // If the current vertex is the right bounding vertex
      if (!relativeHorizontalOrder.value[vertex.key]?.next) {
        const prevRightKey = relativeHorizontalOrder.value[vertex.key]?.prev;
        const prevRightPosition =
          relativeHorizontalOrder.value[prevRightKey || '']?.position;
        if (prevRightPosition) {
          containerBoundingRect.right.value =
            prevRightPosition + settings.radius;
        }
      }
      // If the current vertex is the top bounding vertex
      if (!relativeVerticalOrder.value[vertex.key]?.prev) {
        const nextTopKey = relativeVerticalOrder.value[vertex.key]?.next;
        const nextTopPosition =
          relativeVerticalOrder.value[nextTopKey || '']?.position;
        if (nextTopPosition) {
          containerBoundingRect.top.value = nextTopPosition - settings.radius;
        }
      }
      // If the current vertex is the bottom bounding vertex
      if (!relativeVerticalOrder.value[vertex.key]?.next) {
        const prevBottomKey = relativeVerticalOrder.value[vertex.key]?.prev;
        const prevBottomPosition =
          relativeVerticalOrder.value[prevBottomKey || '']?.position;
        if (prevBottomPosition) {
          containerBoundingRect.bottom.value =
            prevBottomPosition + settings.radius;
        }
      }

      // Remove vertex from animated positions if it's removed from the graph
      setAnimatedPosition(vertex.key, null);
      setAnimatedPlacementPosition(vertex.key, null);
    };
  }, [key]);

  // Update bounding vertices if vertex x position coordinate was changed
  useAnimatedReaction(
    () => ({
      x: positionX.value
    }),
    ({ x }) => {
      const relativeOrder = relativeHorizontalOrder.value;
      const { prev: prevKey, next: nextKey } = relativeOrder[key] || {};

      const prevOrder = relativeOrder[prevKey || ''];
      const nextOrder = relativeOrder[nextKey || ''];

      const prevPrevKey = prevOrder?.prev;
      const prevPrevOrder = relativeOrder[prevPrevKey || ''];

      const nextNextKey = nextOrder?.next;
      const nextNextOrder = relativeOrder[nextNextKey || ''];

      const prev =
        prevOrder && prevKey
          ? {
              key: prevKey,
              order: prevOrder
            }
          : null;
      const next =
        nextOrder && nextKey
          ? {
              key: nextKey,
              order: nextOrder
            }
          : null;
      const prevPrev =
        prevPrevOrder && prevPrevKey
          ? {
              key: prevPrevKey,
              order: prevPrevOrder
            }
          : null;
      const nextNext =
        nextNextOrder && nextNextKey
          ? {
              key: nextNextKey,
              order: nextNextOrder
            }
          : null;

      // Update the relative vertices order if the current vertex passed the next
      // vertex
      if (next && x > next.order.position) {
        // Update the current vertex relative order
        relativeHorizontalOrder.value[key] = {
          next: nextNext?.key,
          prev: next.key,
          position: x
        };
        // Update the next vertex relative to the current vertex
        relativeHorizontalOrder.value[next.key] = {
          next: key,
          prev: prev?.key,
          position: next.order.position
        };
        // Update the previous vertex relative to the current vertex
        if (prev) {
          prev.order.next = next.key;
        }
        // Update the next vertex relative to the next vertex
        if (nextNext) {
          nextNext.order.prev = key;
        }
      }
      // Update the relative vertices order if the current vertex passed the previous
      // vertex
      else if (prev && x < prev.order.position) {
        // Update the current vertex relative order
        relativeHorizontalOrder.value[key] = {
          next: prev.key,
          prev: prevPrev?.key,
          position: x
        };
        // Update the previous vertex relative to the current vertex
        relativeHorizontalOrder.value[prev.key] = {
          next: next?.key,
          prev: key,
          position: prev.order.position
        };
        // Update the next vertex relative to the current vertex
        if (next) {
          next.order.prev = prev.key;
        }
        // Update the previous vertex relative to the previous vertex
        if (prevPrev) {
          prevPrev.order.next = key;
        }
      }

      // Update the container bounding rectangle if the current vertex is the bounding
      // vertex
      if (!prev) {
        containerBoundingRect.left.value = x - settings.radius;
      }
      if (!next) {
        containerBoundingRect.right.value = x + settings.radius;
      }

      // Update the vertex relative order position
      const vertexOrder = relativeHorizontalOrder.value[key];
      if (vertexOrder) {
        vertexOrder.position = x;
      }
    }
  );

  // Update bounding vertices if vertex y position coordinate was changed
  useAnimatedReaction(
    () => ({
      y: positionY.value
    }),
    ({ y }) => {
      const relativeOrder = relativeVerticalOrder.value;
      const { prev: prevKey, next: nextKey } = relativeOrder[key] || {};

      const prevOrder = relativeOrder[prevKey || ''];
      const nextOrder = relativeOrder[nextKey || ''];

      const prevPrevKey = prevOrder?.prev;
      const prevPrevOrder = relativeOrder[prevPrevKey || ''];

      const nextNextKey = nextOrder?.next;
      const nextNextOrder = relativeOrder[nextNextKey || ''];

      const prev =
        prevKey && prevOrder
          ? {
              key: prevKey,
              order: prevOrder
            }
          : null;
      const next =
        nextOrder && nextKey
          ? {
              key: nextKey,
              order: nextOrder
            }
          : null;
      const prevPrev =
        prevPrevOrder && prevPrevKey
          ? {
              key: prevPrevKey,
              order: prevPrevOrder
            }
          : null;
      const nextNext =
        nextNextOrder && nextNextKey
          ? {
              key: nextNextKey,
              order: nextNextOrder
            }
          : null;
      // Update the relative vertices order if the current vertex passed the next
      // vertex
      if (next && y > next.order.position) {
        // Update the current vertex relative order
        relativeVerticalOrder.value[key] = {
          next: nextNext?.key,
          prev: next.key,
          position: y
        };
        // Update the next vertex relative to the current vertex
        relativeVerticalOrder.value[next.key] = {
          next: key,
          prev: prev?.key,
          position: next.order.position
        };
        // Update the previous vertex relative to the current vertex
        if (prev) {
          prev.order.next = next.key;
        }
        // Update the next vertex relative to the next vertex
        if (nextNext) {
          nextNext.order.prev = key;
        }
      }
      // Update the relative vertices order if the current vertex passed the previous
      // vertex
      else if (prev && y < prev.order.position) {
        // Update the current vertex relative order
        relativeVerticalOrder.value[key] = {
          next: prev.key,
          prev: prevPrev?.key,
          position: y
        };
        // Update the previous vertex relative to the current vertex
        relativeVerticalOrder.value[prev.key] = {
          next: next?.key,
          prev: key,
          position: prev.order.position
        };
        // Update the next vertex relative to the current vertex
        if (next) {
          next.order.prev = prev.key;
        }
        // Update the previous vertex relative to the previous vertex
        if (prevPrev) {
          prevPrev.order.next = key;
        }
      }

      // Update the container bounding rectangle if the current vertex is the bounding
      // vertex
      if (!prev) {
        containerBoundingRect.top.value = y - settings.radius;
      }
      if (!next) {
        containerBoundingRect.bottom.value = y + settings.radius;
      }

      // Update the vertex relative order position
      const vertexOrder = relativeVerticalOrder.value[key];
      if (vertexOrder) {
        vertexOrder.position = y;
      }
    }
  );

  // Render the vertex component
  return renderer({
    key: vertex.key,
    data: vertex.value,
    radius: settings.radius,
    position: { x: positionX, y: positionY }
  });
}

export default memo(VertexComponent) as <V, E>(
  props: VertexComponentProps<V, E>
) => JSX.Element;

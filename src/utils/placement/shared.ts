import potpack from 'potpack';

import { Vertex } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedDimensions,
  BoundingRect,
  Dimensions
} from '@/types/layout';
import {
  AnimatedPlacedVerticesPositions,
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/settings';

export const calcContainerBoundingRect = (
  placedVertices: PlacedVerticesPositions,
  minVertexSpacing = 0,
  vertexRadius = 0
): BoundingRect => {
  'worklet';
  const vertices = Object.values(placedVertices);

  if (!vertices.length) {
    return {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const { x, y } of vertices) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  return {
    bottom: maxY + vertexRadius + minVertexSpacing / 2,
    left: minX - vertexRadius - minVertexSpacing / 2,
    right: maxX + vertexRadius + minVertexSpacing / 2,
    top: minY - vertexRadius - minVertexSpacing / 2
  };
};

export const calcAnimatedContainerBoundingRect = (
  placedVertices: AnimatedPlacedVerticesPositions
): BoundingRect => {
  'worklet';
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;

  for (const { x, y } of Object.values(placedVertices)) {
    left = Math.min(left, x.value);
    right = Math.max(right, x.value);
    top = Math.min(top, y.value);
    bottom = Math.max(bottom, y.value);
  }

  return {
    bottom,
    left,
    right,
    top
  };
};

export const animatedBoundingRectToRect = (
  boundingRect: AnimatedBoundingRect
): BoundingRect => {
  'worklet';
  return {
    bottom: boundingRect.bottom.value,
    left: boundingRect.left.value,
    right: boundingRect.right.value,
    top: boundingRect.top.value
  };
};

export const animatedCanvasDimensionsToDimensions = (
  canvasDimensions: AnimatedDimensions
): Dimensions => {
  'worklet';
  return {
    height: canvasDimensions.height.value,
    width: canvasDimensions.width.value
  };
};

export const defaultSortComparator = <V, E>(
  u: Vertex<V, E>,
  v: Vertex<V, E>
) => {
  if (u.key < v.key) {
    return -1;
  }
  if (u.key > v.key) {
    return 1;
  }
  return 0;
};

export const arrangeGraphComponents = (
  graphComponents: Array<GraphLayout>,
  vertexRadius: number
): GraphLayout => {
  // Prepare graph components for packing
  const preparedComponents = graphComponents.map(
    ({ boundingRect: { bottom, left, right, top }, verticesPositions }) => ({
      h: bottom - top,
      verticesPositions,
      w: right - left,
      x: 0,
      y: 0
    })
  );
  // Pack graph components on the screen
  const packed = potpack(preparedComponents);
  // Translate graph components to correct positions on the screen
  const verticesPositions = Object.fromEntries(
    preparedComponents.flatMap(
      ({ h, verticesPositions: positions, w, x, y }) => {
        const { bottom, left, right, top } =
          calcContainerBoundingRect(positions);

        // calculate the shift of graph center relative to component center
        const widthShift = w / 2 - (left + right) / 2;
        const heightShift = h / 2 - (top + bottom) / 2;

        return Object.entries(positions).map(([key, { x: vx, y: vy }]) => [
          key,
          {
            x: vx + x - packed.w / 2 + widthShift,
            y: vy + y - packed.h / 2 + heightShift
          }
        ]);
      }
    )
  );

  return {
    boundingRect: calcContainerBoundingRect(verticesPositions, 0, vertexRadius),
    verticesPositions
  };
};

export const alignPositionsToCenter = (
  positions: PlacedVerticesPositions
): {
  boundingRect: BoundingRect;
  verticesPositions: PlacedVerticesPositions;
} => {
  'worklet';
  const { bottom, left, right, top } = calcContainerBoundingRect(positions);
  const width = right - left;
  const height = bottom - top;
  const offsetX = width / 2 + left;
  const offsetY = height / 2 + top;

  const newPositions = Object.fromEntries(
    Object.entries(positions).map(([key, { x, y }]) => [
      key,
      {
        x: x - offsetX,
        y: y - offsetY
      }
    ])
  );

  return {
    boundingRect: {
      bottom: bottom - offsetY,
      left: left - offsetX,
      right: right - offsetX,
      top: top - offsetY
    },
    verticesPositions: newPositions
  };
};

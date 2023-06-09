import potpack from 'potpack';

import { Vertex } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import {
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/settings/placement';

export const calcContainerBoundingRect = (
  placedVertices: PlacedVerticesPositions,
  minVertexSpacing: number,
  vertexRadius: number
): BoundingRect => {
  'worklet';
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  for (const { x, y } of Object.values(placedVertices)) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  return {
    top: minY - vertexRadius - minVertexSpacing / 2,
    bottom: maxY + vertexRadius + minVertexSpacing / 2,
    left: minX - vertexRadius - minVertexSpacing / 2,
    right: maxX + vertexRadius + minVertexSpacing / 2
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
    ({ boundingRect: { top, bottom, left, right }, verticesPositions }) => ({
      w: right - left,
      h: bottom - top,
      x: 0,
      y: 0,
      verticesPositions
    })
  );
  // Pack graph components on the screen
  const packed = potpack(preparedComponents);
  // Translate graph components to correct positions on the screen
  const verticesPositions = Object.fromEntries(
    preparedComponents.flatMap(({ verticesPositions: positions, x, y, w, h }) =>
      Object.entries(positions).map(([key, { x: vx, y: vy }]) => [
        key,
        {
          x: vx + x + (w - packed.w) / 2,
          y: vy + y + (h - packed.h) / 2
        }
      ])
    )
  );

  return {
    verticesPositions,
    boundingRect: calcContainerBoundingRect(verticesPositions, 0, vertexRadius)
  };
};

import potpack from 'potpack';

import { Vertex } from '@/types/graphs';
import { Dimensions } from '@/types/layout';
import {
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/settings/placement';

export const calcContainerDimensions = (
  placedVertices: PlacedVerticesPositions,
  vertexRadius: number
): Dimensions => {
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
    width: maxX - minX + 2 * vertexRadius,
    height: maxY - minY + 2 * vertexRadius
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
  graphComponents: Array<GraphLayout>
): GraphLayout => {
  // Prepare graph components for packing
  const preparedComponents = graphComponents.map(
    ({ width: w, height: h, verticesPositions }) => ({
      w,
      h,
      x: 0,
      y: 0,
      verticesPositions
    })
  );
  // Pack graph components on the screen
  const packed = potpack(preparedComponents);
  // Translate graph components to correct positions on the screen
  return {
    width: packed.w,
    height: packed.h,
    verticesPositions: Object.fromEntries(
      preparedComponents.flatMap(({ verticesPositions, x, y, w, h }) =>
        Object.entries(verticesPositions).map(([key, { x: vx, y: vy }]) => [
          key,
          {
            x: vx + x + (w - packed.w) / 2,
            y: vy + y + (h - packed.h) / 2
          }
        ])
      )
    )
  };
};

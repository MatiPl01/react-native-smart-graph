import { Graph } from '@/types/graphs';
import {
  CircularPlacementSettings,
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/placement';

import { SHARED } from '../constants';
import { defaultSortComparator } from '../shared';

const placeVerticesCircular = <V, E>(
  graph: Graph<V, E>,
  {
    sortComparator = defaultSortComparator,
    sortVertices = false,
    vertexRadius = SHARED.vertexRadius,
    minVertexSpacing = SHARED.minVertexSpacing
  }: CircularPlacementSettings<V, E>
): GraphLayout => {
  const vertices = sortVertices
    ? graph.vertices.sort(sortComparator)
    : graph.vertices;

  const initialAngle = -Math.PI / 2;
  const { radius, center, angleStep, width, height } = getLayout(
    vertices.length,
    vertexRadius,
    minVertexSpacing
  );

  return {
    width,
    height,
    verticesPositions: vertices.reduce((acc, { key }, idx) => {
      acc[key] = {
        x: center.x + radius * Math.cos(initialAngle + angleStep * idx),
        y: center.y + radius * Math.sin(initialAngle + angleStep * idx)
      };
      return acc;
    }, {} as PlacedVerticesPositions)
  };
};

const getLayout = (
  verticesCount: number,
  vertexRadius: number,
  minVertexSpacing: number
) => {
  let angleStep, radius;

  if (verticesCount <= 1) {
    angleStep = 0;
    radius = 0;
  } else {
    angleStep = (2 * Math.PI) / verticesCount;
    radius =
      (2 * vertexRadius + minVertexSpacing) / (2 * Math.sin(angleStep / 2));
  }

  const containerSize = 2 * radius + 2 * vertexRadius;

  return {
    angleStep,
    radius,
    width: containerSize,
    height: containerSize,
    center: {
      x: containerSize / 2,
      y: containerSize / 2
    }
  };
};

export default placeVerticesCircular;

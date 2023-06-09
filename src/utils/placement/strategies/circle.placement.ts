import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { Vertex } from '@/types/graphs';
import {
  CircularPlacementSettings,
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/settings';
import { defaultSortComparator } from '@/utils/placement/shared';

const placeVerticesOnCircle = <V, E>(
  vertices: Array<Vertex<V, E>>,
  vertexRadius: number,
  {
    sortComparator = defaultSortComparator,
    sortVertices = false,
    minVertexSpacing = SHARED_PLACEMENT_SETTINGS.minVertexSpacing
  }: CircularPlacementSettings<V, E>
): GraphLayout => {
  const updatedVertices = sortVertices
    ? vertices.sort(sortComparator)
    : vertices;

  const initialAngle = -Math.PI / 2;
  const { radius, angleStep, containerRadius } = getLayout(
    updatedVertices.length,
    vertexRadius,
    minVertexSpacing
  );

  return {
    boundingRect: {
      top: -containerRadius,
      left: -containerRadius,
      right: containerRadius,
      bottom: containerRadius
    },
    verticesPositions: updatedVertices.reduce((acc, { key }, idx) => {
      acc[key] = {
        x: radius * Math.cos(initialAngle + angleStep * idx),
        y: radius * Math.sin(initialAngle + angleStep * idx)
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

  const containerRadius = radius + vertexRadius + minVertexSpacing / 2;

  return {
    angleStep,
    radius,
    containerRadius
  };
};

export default placeVerticesOnCircle;

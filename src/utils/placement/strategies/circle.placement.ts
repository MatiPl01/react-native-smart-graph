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
  const { radius, angleStep, width, height } = getLayout(
    updatedVertices.length,
    vertexRadius,
    minVertexSpacing
  );
  const padding = minVertexSpacing;

  return {
    width: width + padding,
    height: height + padding,
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

  const containerSize = 2 * radius + 2 * vertexRadius;

  return {
    angleStep,
    radius,
    width: containerSize,
    height: containerSize
  };
};

export default placeVerticesOnCircle;

import {
  AllCirclePlacementSettings,
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/settings';
import { defaultSortComparator } from '@/utils/placement/shared';

const getLayout = (
  verticesCount: number,
  vertexRadius: number,
  minVertexSpacing: number
) => {
  'worklet';
  let angleStep, radius;

  if (verticesCount <= 1) {
    angleStep = 0;
    radius = 0;
  } else {
    angleStep = (2 * Math.PI) / verticesCount;
    radius =
      (2 * vertexRadius + minVertexSpacing) / (2 * Math.sin(angleStep / 2));
  }

  const containerRadius = radius + vertexRadius;

  return {
    angleStep,
    containerRadius,
    radius
  };
};

export default function placeVerticesOnCircle<
  S extends Omit<AllCirclePlacementSettings, 'strategy'>
>(vertices: Array<string>, vertexRadius: number, settings: S): GraphLayout {
  'worklet';
  const updatedVertices = settings?.sortVertices
    ? vertices.sort(settings?.sortComparator ?? defaultSortComparator)
    : vertices;

  const initialAngle = -Math.PI / 2;
  const { angleStep, containerRadius, radius } = getLayout(
    updatedVertices.length,
    vertexRadius,
    settings.minVertexSpacing
  );

  return {
    boundingRect: {
      bottom: containerRadius,
      left: -containerRadius,
      right: containerRadius,
      top: -containerRadius
    },
    verticesPositions: updatedVertices.reduce((acc, key, idx) => {
      acc[key] = {
        x: radius * Math.cos(initialAngle + angleStep * idx),
        y: radius * Math.sin(initialAngle + angleStep * idx)
      };
      return acc;
    }, {} as PlacedVerticesPositions)
  };
}

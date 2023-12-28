import {
  AllCirclePlacementSettings,
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/settings';
import { defaultSortComparator } from '@/utils/placement/shared';

const getLayout = (verticesCount: number, minVertexDistance: number) => {
  'worklet';
  let angleStep, radius;

  if (verticesCount <= 1) {
    angleStep = 0;
    radius = 0;
  } else {
    angleStep = (2 * Math.PI) / verticesCount;
    radius = minVertexDistance / (2 * Math.sin(angleStep / 2));
  }

  return {
    angleStep,
    radius
  };
};

const placeVerticesOnCircle = <
  S extends Omit<AllCirclePlacementSettings, 'strategy'>
>(
  vertices: Array<string>,
  settings: S
): GraphLayout => {
  'worklet';
  const updatedVertices = settings?.sortVertices
    ? vertices.sort(settings?.sortComparator ?? defaultSortComparator)
    : vertices;

  const initialAngle = -Math.PI / 2;
  const { angleStep, radius } = getLayout(
    updatedVertices.length,
    settings.minVertexDistance
  );

  return {
    boundingRect: {
      bottom: radius,
      left: -radius,
      right: radius,
      top: -radius
    },
    verticesPositions: updatedVertices.reduce((acc, key, idx) => {
      acc[key] = {
        x: radius * Math.cos(initialAngle + angleStep * idx),
        y: radius * Math.sin(initialAngle + angleStep * idx)
      };
      return acc;
    }, {} as PlacedVerticesPositions)
  };
};

// The export declaration must be at the end of the file
// to ensure that babel can properly transform the file
// to the commonjs format (worklets cannot be reordered)
export default placeVerticesOnCircle;

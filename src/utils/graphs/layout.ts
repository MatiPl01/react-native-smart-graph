import { Vector } from '@shopify/react-native-skia';

import { AnimatedVectorCoordinates } from '@/types/layout';

import { animatedVectorToVector, distanceBetweenVectors } from '../vectors';

export const findClosestVertex = (
  position: Vector,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): string | null => {
  let closestVertexKey: string | null = null;
  let closestVertexDistance = Infinity;

  Object.entries(animatedVerticesPositions).forEach(
    ([key, animatedPosition]) => {
      const distance = distanceBetweenVectors(
        position,
        animatedVectorToVector(animatedPosition)
      );
      if (distance < closestVertexDistance) {
        closestVertexKey = key;
        closestVertexDistance = distance;
      }
    }
  );

  return closestVertexKey;
};

export const findPressedVertex = (
  position: Vector,
  vertexRadius: number,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): string | null => {
  const closestVertexKey = findClosestVertex(
    position,
    animatedVerticesPositions
  );

  if (closestVertexKey) {
    const closestVertexPosition = animatedVectorToVector(
      animatedVerticesPositions[closestVertexKey]
    );

    const distance = distanceBetweenVectors(position, closestVertexPosition);

    if (distance <= vertexRadius) {
      return closestVertexKey;
    }
  }

  return null;
};

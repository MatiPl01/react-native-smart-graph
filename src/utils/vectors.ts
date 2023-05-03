import { Vector, vec } from '@shopify/react-native-skia';

import { AnimatedPositionCoordinates, Position } from '@/types/layout';

// TODO - change Position type to Vector
export const calcUnitVector = (from: Position, to: Position): Position => {
  'worklet';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mag = Math.sqrt(dx ** 2 + dy ** 2);

  return { x: dx / mag, y: dy / mag };
};

export const translateAlongVector = (
  point: Position,
  unitVector: Position,
  distance: number
): Position => {
  'worklet';
  return {
    x: point.x + unitVector.x * distance,
    y: point.y + unitVector.y * distance
  };
};

export const animatedVectorToVector = (
  vector: AnimatedPositionCoordinates
): Vector => {
  'worklet';
  return {
    x: vector.x.value,
    y: vector.y.value
  };
};

export const addVectors = (...vectors: Vector[]): Vector => {
  'worklet';
  return addVectorsArray(vectors);
};

export const addVectorsArray = (vectors: Vector[]): Vector => {
  'worklet';
  return vectors.reduce(
    (accVector, currentVector) => ({
      x: accVector.x + currentVector.x,
      y: accVector.y + currentVector.y
    }),
    vec(0, 0)
  );
};

export const subtractVectors = (vector1: Vector, vector2: Vector): Vector => {
  'worklet';
  return vec(vector1.x - vector2.x, vector1.y - vector2.y);
};

export const multiplyVector = (vector: Vector, factor: number): Vector => {
  'worklet';
  return vec(vector.x * factor, vector.y * factor);
};

export const vectorLength = (vector: Vector): number => {
  'worklet';
  return Math.sqrt(vector.x ** 2 + vector.y ** 2);
};

export const distanceBetweenVectors = (
  vector1: Vector,
  vector2: Vector
): number => {
  'worklet';
  return vectorLength(subtractVectors(vector1, vector2));
};

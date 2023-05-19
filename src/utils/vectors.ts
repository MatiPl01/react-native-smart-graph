import { Vector, vec } from '@shopify/react-native-skia';

import { AnimatedVectorCoordinates } from '@/types/layout';

export const calcUnitVector = (from: Vector, to: Vector): Vector => {
  'worklet';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mag = Math.sqrt(dx ** 2 + dy ** 2);

  return { x: dx / mag, y: dy / mag };
};

export const translateAlongVector = (
  point: Vector,
  unitVector: Vector,
  distance: number
): Vector => {
  'worklet';
  return {
    x: point.x + unitVector.x * distance,
    y: point.y + unitVector.y * distance
  };
};

export const animatedVectorToVector = (
  vector?: AnimatedVectorCoordinates
): Vector => {
  'worklet';
  return vector
    ? {
        x: vector.x.value,
        y: vector.y.value
      }
    : vec(0, 0);
};

export const addVectors = (...vectors: Array<Vector>): Vector => {
  'worklet';
  return addVectorsArray(vectors);
};

export const addVectorsArray = (vectors: Array<Vector>): Vector => {
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

export const distanceBetweenPointAndLine = (
  point: Vector,
  lineStart: Vector,
  lineEnd: Vector
): number => {
  'worklet';
  if (point.x - lineStart.x === 0 || point.y - lineStart.y === 0) {
    return 0;
  }

  const a = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
  const b = lineStart.y - a * lineStart.x;

  const A = a;
  const B = -1;
  const C = b;

  return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A ** 2 + B ** 2);
};

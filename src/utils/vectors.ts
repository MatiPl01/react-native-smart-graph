import { Vector } from '@shopify/react-native-skia';

export const calcUnitVector = (from: Vector, to: Vector): Vector => {
  'worklet';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mag = Math.sqrt(dx ** 2 + dy ** 2);

  return mag > 0 ? { x: dx / mag, y: dy / mag } : { x: 0, y: 0 };
};

export const calcOrthogonalVector = (vector: Vector): Vector => {
  'worklet';
  return { x: -vector.y, y: vector.x };
};

export const calcOrthogonalUnitVector = (from: Vector, to: Vector): Vector => {
  'worklet';
  const unitVector = calcUnitVector(from, to);
  return calcOrthogonalVector(unitVector);
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

export const addVectorsArray = (vectors: Array<Vector>): Vector => {
  'worklet';
  return vectors.reduce(
    (accVector, currentVector) => ({
      x: accVector.x + currentVector.x,
      y: accVector.y + currentVector.y
    }),
    { x: 0, y: 0 }
  );
};

export const addVectors = (...vectors: Array<Vector>): Vector => {
  'worklet';
  return addVectorsArray(vectors);
};

export const subtractVectors = (vector1: Vector, vector2: Vector): Vector => {
  'worklet';
  return { x: vector1.x - vector2.x, y: vector1.y - vector2.y };
};

export const multiplyVector = (vector: Vector, factor: number): Vector => {
  'worklet';
  return { x: vector.x * factor, y: vector.y * factor };
};

export const averageVector = (vectors: Array<Vector>): Vector => {
  'worklet';
  if (!vectors.length) return { x: 0, y: 0 };
  return multiplyVector(addVectorsArray(vectors), 1 / vectors.length);
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

export const getLineCenter = (vector1: Vector, vector2: Vector): Vector => {
  'worklet';
  return {
    x: (vector1.x + vector2.x) / 2,
    y: (vector1.y + vector2.y) / 2
  };
};

export const areVectorsEqual = (
  vector1: Vector,
  vector2: Vector,
  eps = 10e-4
): boolean => {
  'worklet';
  return distanceBetweenVectors(vector1, vector2) < eps;
};

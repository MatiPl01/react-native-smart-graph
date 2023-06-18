import { vec, Vector } from '@shopify/react-native-skia';

import { AnimatedVector, AnimatedVectorCoordinates } from '@/types/layout';

export const calcUnitVector = (from: Vector, to: Vector): Vector => {
  'worklet';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mag = Math.sqrt(dx ** 2 + dy ** 2);

  return mag > 0 ? { x: dx / mag, y: dy / mag } : { x: 0, y: 0 };
};

export const calcOrthogonalUnitVector = (from: Vector, to: Vector): Vector => {
  'worklet';
  const unitVector = calcUnitVector(from, to);
  return { x: -unitVector.y, y: unitVector.x };
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

export const animatedVectorCoordinatesToVector = (
  vector?: AnimatedVectorCoordinates
): Vector => {
  'worklet';
  return vector
    ? {
        x: vector.x.value,
        y: vector.y.value
      }
    : { x: 0, y: 0 };
};

export const animatedVectorToVector = (vector?: AnimatedVector): Vector => {
  'worklet';
  return vector
    ? {
        x: vector.value.x,
        y: vector.value.y
      }
    : vec(0, 0);
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

export const vectorLength = (vector: Vector): number => {
  'worklet';
  return Math.sqrt(vector.x ** 2 + vector.y ** 2);
};

export const dotProduct = (vector1: Vector, vector2: Vector): number => {
  'worklet';
  return vector1.x * vector2.x + vector1.y * vector2.y;
};

export const distanceBetweenVectors = (
  vector1: Vector,
  vector2: Vector
): number => {
  'worklet';
  return vectorLength(subtractVectors(vector1, vector2));
};

// answer with great explanation - https://stackoverflow.com/a/6853926
export const distanceBetweenPointAndSegment = (
  point: Vector,
  lineStart: Vector,
  lineEnd: Vector
): number => {
  'worklet';
  const A = subtractVectors(point, lineStart);
  const B = subtractVectors(lineEnd, lineStart);

  const dot = dotProduct(A, B);
  const len2 = vectorLength(B) ** 2;
  let param = -1;
  if (len2 !== 0) {
    param = dot / len2;
  }

  let projectedPoint: Vector;
  if (param < 0) {
    projectedPoint = lineStart;
  } else if (param > 1) {
    projectedPoint = lineEnd;
  } else {
    projectedPoint = addVectors(lineStart, multiplyVector(B, param));
  }

  return distanceBetweenVectors(point, projectedPoint);
};

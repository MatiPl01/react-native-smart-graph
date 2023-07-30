import { Vector } from '@shopify/react-native-skia';

const parabola = (x: number, a: number, p: number, q: number): number => {
  'worklet';
  return a * (x - p) ** 2 + q;
};

export const calcApproxPointOnParabola = (
  x1: number,
  a: number,
  p: number,
  q: number,
  d: number
): Vector => {
  'worklet';
  const tangentSlope = 2 * a * (x1 - p);
  const dPrime = d / Math.sqrt(1 + tangentSlope * tangentSlope);
  const x2 = x1 + dPrime;
  const y2 = parabola(x2, a, p, q);
  return { x: x2, y: y2 };
};

export const isBetween = (x: number, a: number, b: number): boolean => {
  'worklet';
  let lower = a;
  let upper = b;

  // If a > b, swap them
  if (a > b) {
    lower = b;
    upper = a;
  }

  return x >= lower && x <= upper;
};

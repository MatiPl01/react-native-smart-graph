/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vector } from '@shopify/react-native-skia';

const cross = (v1: Vector, v2: Vector, v3: Vector): number => {
  'worklet';
  return (v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x);
};

export const grahamScan = (points: Vector[]): Vector[] => {
  'worklet';
  if (points.length < 3) {
    return points;
  }

  // Find the lowest y point
  const lowestYPoint = points.reduce((lowest, point) => {
    if (point.y < lowest!.y) {
      return point;
    } else if (point.y === lowest!.y && point.x < lowest!.x) {
      return point;
    }
    return lowest;
  }, points[0]) as Vector;

  // Sort points by angle around the lowest y point
  const sortedPoints = points.slice().sort((a, b) => {
    const angleA = Math.atan2(a.y - lowestYPoint.y, a.x - lowestYPoint.x);
    const angleB = Math.atan2(b.y - lowestYPoint.y, b.x - lowestYPoint.x);

    if (angleA < angleB) {
      return -1;
    } else if (angleA > angleB) {
      return 1;
    }
    return 0;
  });

  // Create the hull
  const hull: Vector[] = [sortedPoints[0]!, sortedPoints[1]!];
  for (let i = 2; i < sortedPoints.length; i++) {
    while (
      hull.length >= 2 &&
      cross(hull[hull.length - 2]!, hull[hull.length - 1]!, sortedPoints[i]!) <=
        0
    ) {
      hull.pop();
    }
    hull.push(sortedPoints[i]!);
  }

  return hull;
};

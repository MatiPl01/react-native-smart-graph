import { Vector } from '@shopify/react-native-skia';

import { VertexComponentRenderData } from '@/types/components';
import {
  Alignment,
  AxisSpacing,
  BoundingRect,
  Dimensions,
  Spacing
} from '@/types/layout';

import {
  animatedVectorCoordinatesToVector,
  distanceBetweenVectors
} from './vectors';

export const findCenterOfPoints = (positions: Array<Vector>): Vector | null => {
  'worklet';
  if (positions.length === 0) {
    return null;
  }
  const xSum = positions.reduce((acc, position) => acc + position.x, 0);
  const ySum = positions.reduce((acc, position) => acc + position.y, 0);
  return {
    x: xSum / positions.length,
    y: ySum / positions.length
  };
};

export const getCoordinatesRelativeToCenter = (
  canvasDimensions: Dimensions,
  position: Vector
): Vector => {
  'worklet';
  return {
    x: position.x - canvasDimensions.width / 2,
    y: position.y - canvasDimensions.height / 2
  };
};

export const getAlignedVertexAbsolutePosition = (
  canvasDimensions: Dimensions,
  alignment: Required<Alignment>,
  vertexRadius: number
): Vector => {
  'worklet';
  const {
    horizontalAlignment,
    horizontalOffset,
    verticalAlignment,
    verticalOffset
  } = alignment;

  const x =
    horizontalAlignment === 'left'
      ? vertexRadius + horizontalOffset
      : horizontalAlignment === 'right'
      ? canvasDimensions.width - vertexRadius - horizontalOffset
      : canvasDimensions.width / 2;
  const y =
    verticalAlignment === 'top'
      ? vertexRadius + verticalOffset
      : verticalAlignment === 'bottom'
      ? canvasDimensions.height - vertexRadius - verticalOffset
      : canvasDimensions.height / 2;

  return { x, y };
};

const ALL_SPACING_KEYS = new Set(['bottom', 'left', 'right', 'top']);

const isAllSpacing = (spacing: Spacing): spacing is BoundingRect =>
  typeof spacing === 'object' &&
  Object.keys(spacing).every(value => ALL_SPACING_KEYS.has(value));

export const updateSpacing = (spacing?: Spacing): BoundingRect => {
  'worklet';
  if (!spacing) {
    return { bottom: 0, left: 0, right: 0, top: 0 };
  }
  if (!isNaN(spacing as number)) {
    return {
      bottom: spacing as number,
      left: spacing as number,
      right: spacing as number,
      top: spacing as number
    };
  }
  if (isAllSpacing(spacing)) {
    return Object.fromEntries(
      ([...ALL_SPACING_KEYS] as (keyof BoundingRect)[]).map(key => [
        key,
        spacing[key] ?? 0
      ])
    ) as BoundingRect;
  }
  const { horizontal, vertical } = spacing as AxisSpacing;
  return {
    bottom: vertical ?? 0,
    left: horizontal ?? 0,
    right: horizontal ?? 0,
    top: vertical ?? 0
  };
};

const findClosestVertex = (
  position: Vector,
  verticesData: Record<string, VertexComponentRenderData>
): null | string => {
  'worklet';
  let closestVertexKey: null | string = null;
  let closestVertexDistance = Infinity;

  Object.entries(verticesData).forEach(
    ([key, { position: vertexPosition }]) => {
      const distance = distanceBetweenVectors(
        position,
        animatedVectorCoordinatesToVector(vertexPosition)
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
  hitSlop: number,
  verticesData: Record<string, VertexComponentRenderData>
): null | string => {
  'worklet';
  const closestVertexKey = findClosestVertex(position, verticesData);

  if (closestVertexKey) {
    const closestVertexPosition = animatedVectorCoordinatesToVector(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      verticesData[closestVertexKey]!.position
    );

    const distance = distanceBetweenVectors(position, closestVertexPosition);

    if (distance <= vertexRadius + hitSlop) {
      return closestVertexKey;
    }
  }

  return null;
};

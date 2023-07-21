import { Vector } from '@shopify/react-native-skia';

import {
  Alignment,
  AxisSpacing,
  BoundingRect,
  Dimensions,
  Spacing
} from '@/types/layout';

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

// Use object instead of set to support reanimated worklets
const ALL_SPACING_KEYS = { bottom: true, left: true, right: true, top: true };

const isAllSpacing = (spacing: Spacing): spacing is BoundingRect => {
  'worklet';
  return (
    typeof spacing === 'object' &&
    Object.keys(spacing).every(
      value => ALL_SPACING_KEYS[value as keyof typeof ALL_SPACING_KEYS]
    )
  );
};

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
      ([...Object.keys(ALL_SPACING_KEYS)] as (keyof BoundingRect)[]).map(
        key => [key, spacing[key] ?? 0]
      )
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

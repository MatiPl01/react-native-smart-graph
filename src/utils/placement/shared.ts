import potpack from '@/lib/potpack';
import {
  AnimatedBoundingRect,
  AnimatedDimensions,
  BoundingRect,
  Dimensions
} from '@/types/layout';
import {
  AnimatedPlacedVerticesPositions,
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/settings';

export enum Symmetry {
  NONE,
  HORIZONTAL,
  VERTICAL,
  CENTER
}

export const calcContainerBoundingRect = (
  placedVertices: PlacedVerticesPositions,
  settings?: {
    padding?: number;
    symmetry?: Symmetry;
  }
): BoundingRect => {
  'worklet';
  const symmetry = settings?.symmetry ?? Symmetry.NONE;
  const padding = settings?.padding ?? 0;

  const vertices = Object.values(placedVertices);

  if (!vertices.length) {
    return {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const { x, y } of vertices) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  switch (symmetry) {
    case Symmetry.HORIZONTAL:
      minX = Math.min(minX, -maxX);
      maxX = Math.max(maxX, -minX);
      break;
    case Symmetry.VERTICAL:
      minY = Math.min(minY, -maxY);
      maxY = Math.max(maxY, -minY);
      break;
    case Symmetry.CENTER:
      minX = Math.min(minX, -maxX);
      maxX = Math.max(maxX, -minX);
      minY = Math.min(minY, -maxY);
      maxY = Math.max(maxY, -minY);
      break;
  }

  return {
    // bottom: maxY + vertexRadius + minVertexSpacing / 2,
    // left: minX - vertexRadius - minVertexSpacing / 2,
    // right: maxX + vertexRadius + minVertexSpacing / 2,
    // top: minY - vertexRadius - minVertexSpacing / 2
    bottom: maxY + padding,
    left: minX - padding,
    right: maxX + padding,
    top: minY - padding
  };
};

export const calcAnimatedContainerBoundingRect = (
  placedVertices: AnimatedPlacedVerticesPositions,
  vertexRadius: number
): BoundingRect => {
  'worklet';
  const positions = Object.values(placedVertices);
  if (!positions.length) {
    return {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0
    };
  }

  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;

  for (const { x, y } of positions) {
    left = Math.min(left, x.value);
    right = Math.max(right, x.value);
    top = Math.min(top, y.value);
    bottom = Math.max(bottom, y.value);
  }

  return {
    bottom: bottom + vertexRadius,
    left: left - vertexRadius,
    right: right + vertexRadius,
    top: top - vertexRadius
  };
};

export const animatedBoundingRectToRect = (
  boundingRect: AnimatedBoundingRect
): BoundingRect => {
  'worklet';
  return {
    bottom: boundingRect.bottom.value,
    left: boundingRect.left.value,
    right: boundingRect.right.value,
    top: boundingRect.top.value
  };
};

export const animatedCanvasDimensionsToDimensions = (
  canvasDimensions: AnimatedDimensions
): Dimensions => {
  'worklet';
  return {
    height: canvasDimensions.height.value,
    width: canvasDimensions.width.value
  };
};

export const defaultSortComparator = (key1: string, key2: string) => {
  'worklet';
  return key1.localeCompare(key2);
};

export const arrangeGraphComponents = (
  graphComponents: Array<GraphLayout>,
  spacing: number
): GraphLayout => {
  'worklet';
  // Prepare graph components for packing
  const preparedComponents = graphComponents.map(
    ({ boundingRect, verticesPositions }) => {
      const { bottom, left, right, top } = boundingRect;
      return {
        boundingRect,
        h: bottom - top + spacing,
        verticesPositions,
        w: right - left + spacing,
        x: 0,
        y: 0
      };
    }
  );
  // Pack graph components on the screen
  const packed = potpack(preparedComponents);

  // Translate graph components to correct positions on the screen
  const translatedLayouts = preparedComponents.map(
    ({ boundingRect, h, verticesPositions: positions, w, x, y }) => {
      const { bottom, left, right, top } = boundingRect;

      // calculate the shift of graph center relative to component center
      const widthShift = w / 2 - (left + right) / 2;
      const heightShift = h / 2 - (top + bottom) / 2;

      const xShift = x - packed.w / 2 + widthShift;
      const yShift = y - packed.h / 2 + heightShift;

      return {
        boundingRect: {
          bottom: bottom + yShift,
          left: left + xShift,
          right: right + xShift,
          top: top + yShift
        },
        verticesPositions: Object.fromEntries(
          Object.entries(positions).map(([key, { x: vx, y: vy }]) => [
            key,
            { x: vx + xShift, y: vy + yShift }
          ])
        )
      };
    }
  );

  // Combine all graph components into one graph layout
  const combinedLayout = translatedLayouts.reduce(
    (acc, { boundingRect, verticesPositions }) => {
      const { bottom, left, right, top } = boundingRect;
      acc.boundingRect.bottom = Math.max(acc.boundingRect.bottom, bottom);
      acc.boundingRect.left = Math.min(acc.boundingRect.left, left);
      acc.boundingRect.right = Math.max(acc.boundingRect.right, right);
      acc.boundingRect.top = Math.min(acc.boundingRect.top, top);
      acc.verticesPositions = {
        ...acc.verticesPositions,
        ...verticesPositions
      };
      return acc;
    },
    {
      boundingRect: {
        bottom: -Infinity,
        left: Infinity,
        right: -Infinity,
        top: Infinity
      },
      verticesPositions: {}
    } as GraphLayout
  );

  return combinedLayout;
};

export const alignPositionsToCenter = (
  positions: PlacedVerticesPositions,
  padding = 0
): {
  boundingRect: BoundingRect;
  verticesPositions: PlacedVerticesPositions;
} => {
  'worklet';
  const { bottom, left, right, top } = calcContainerBoundingRect(positions, {
    padding
  });
  const width = right - left;
  const height = bottom - top;
  const offsetX = width / 2 + left;
  const offsetY = height / 2 + top;

  const newPositions = Object.fromEntries(
    Object.entries(positions).map(([key, { x, y }]) => [
      key,
      {
        x: x - offsetX,
        y: y - offsetY
      }
    ])
  );

  return {
    boundingRect: {
      bottom: bottom - offsetY,
      left: left - offsetX,
      right: right - offsetX,
      top: top - offsetY
    },
    verticesPositions: newPositions
  };
};

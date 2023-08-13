import { Vector } from '@shopify/react-native-skia';

import { Dimensions } from '@/types/layout';
import {
  AllRandomPlacementSettings,
  GraphLayout,
  PlacedVerticesPositions
} from '@/types/settings';
import { zipArrays } from '@/utils/arrays';
import { alignPositionsToCenter } from '@/utils/placement/shared';
import random from '@/utils/random';

type CalcVerticesPositionsProps = {
  density: number;
  minVertexSpacing: number;
  vertexRadius: number;
  vertices: Array<string>;
};

const calcVerticesGridPositions = (
  props: CalcVerticesPositionsProps
): GraphLayout => {
  'worklet';
  const { density, minVertexSpacing, vertexRadius, vertices } = props;
  const verticesCount = vertices.length;

  const maxPointsInLine = Math.ceil(Math.sqrt(verticesCount / density));
  const availablePositions: Array<Vector> = [];

  const shiftedPositionBoundary = (maxPointsInLine - 1) / 2;
  for (let i = -shiftedPositionBoundary; i <= shiftedPositionBoundary; i++) {
    for (let j = -shiftedPositionBoundary; j <= shiftedPositionBoundary; j++) {
      availablePositions.push({
        x: vertexRadius + i * (2 * vertexRadius + minVertexSpacing),
        y: vertexRadius + j * (2 * vertexRadius + minVertexSpacing)
      });
    }
  }
  const selectedPositions = random.sample(availablePositions, verticesCount);

  const verticesPositions = vertices.reduce((acc, key, idx) => {
    acc[key] = selectedPositions[idx] as Vector;
    return acc;
  }, {} as PlacedVerticesPositions);

  return alignPositionsToCenter(verticesPositions, vertexRadius);
};

const calcVerticesTriangularPositions = (
  props: CalcVerticesPositionsProps
): GraphLayout => {
  'worklet';
  const { density, minVertexSpacing, vertexRadius, vertices } = props;
  const verticesCount = vertices.length;
  const minVertexCenterDistance = 2 * vertexRadius + minVertexSpacing;
  const triangleHeight = (minVertexCenterDistance * Math.sqrt(3)) / 2;

  const availablePositionsCount = Math.ceil(verticesCount / density);
  const availablePositions: Array<Vector> = [];

  let lineNumber = 1;
  let currentVertexIndex = 0;

  let maxX = 0;
  let maxY = 0;

  for (let i = 0; i < availablePositionsCount; i++) {
    const numberOfVerticesInLine = Math.ceil(lineNumber / 2);
    let x, y;

    if (lineNumber % 2 === 1) {
      // Vertical line
      x =
        vertexRadius +
        (currentVertexIndex % 2 === 1 ? minVertexCenterDistance / 2 : 0) +
        minVertexCenterDistance * Math.floor(lineNumber / 2);
      y = vertexRadius + currentVertexIndex * triangleHeight;
    } else {
      // Horizontal line
      x =
        vertexRadius +
        ((lineNumber - 2) % 4 === 0 ? minVertexCenterDistance / 2 : 0) +
        currentVertexIndex * minVertexCenterDistance;
      y = vertexRadius + Math.floor(lineNumber / 2) * triangleHeight;
    }

    currentVertexIndex++;
    if (currentVertexIndex === numberOfVerticesInLine) {
      currentVertexIndex = 0;
      lineNumber++;
    }

    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    availablePositions.push({ x, y });
  }

  const shiftedAvailablePositions = availablePositions.map(({ x, y }) => ({
    x: x - maxX / 2,
    y: y - maxY / 2
  }));

  const verticesAndPositions = zipArrays(
    vertices,
    random.sample(shiftedAvailablePositions, verticesCount)
  );

  const verticesPositions = verticesAndPositions.reduce(
    (acc, [key, position]) => {
      acc[key] = position;
      return acc;
    },
    {} as PlacedVerticesPositions
  );

  return alignPositionsToCenter(verticesPositions, vertexRadius);
};

const calcVerticesRandomPositions = (
  vertices: Array<string>,
  vertexRadius: number,
  width: number,
  height: number
): GraphLayout => {
  'worklet';
  const innerWidth = width - 2 * vertexRadius;
  const innerHeight = height - 2 * vertexRadius;

  const verticesPositions = vertices.reduce((acc, key) => {
    acc[key] = {
      x: vertexRadius + (Math.random() - 0.5) * innerWidth,
      y: vertexRadius + (Math.random() - 0.5) * innerHeight
    };
    return acc;
  }, {} as PlacedVerticesPositions);

  return alignPositionsToCenter(verticesPositions, vertexRadius);
};

export default function placeVerticesRandomly(
  vertices: Array<string>,
  vertexRadius: number,
  canvasDimensions: Dimensions,
  settings: AllRandomPlacementSettings
): GraphLayout {
  'worklet';
  if (settings.mesh === 'random') {
    return calcVerticesRandomPositions(
      vertices,
      vertexRadius,
      settings.containerWidth ?? canvasDimensions.width,
      settings.containerHeight ?? canvasDimensions.height
    );
  }

  const props: CalcVerticesPositionsProps = {
    density: settings.density,
    minVertexSpacing: settings.minVertexSpacing,
    vertexRadius,
    vertices
  };

  switch (settings.mesh) {
    case 'triangular':
      return calcVerticesTriangularPositions(props);
    default:
    case 'grid':
      return calcVerticesGridPositions(props);
  }
}

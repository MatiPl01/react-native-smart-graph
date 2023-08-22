import { Dimensions, Vector } from '@/types/layout';
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
  minVertexDistance: number;
  vertices: Array<string>;
};

const calcVerticesGridPositions = (
  props: CalcVerticesPositionsProps
): GraphLayout => {
  'worklet';
  const { density, minVertexDistance, vertices } = props;
  const verticesCount = vertices.length;

  const maxPointsInLine = Math.ceil(Math.sqrt(verticesCount / density));
  const availablePositions: Array<Vector> = [];

  const shiftedPositionBoundary = (maxPointsInLine - 1) / 2;
  for (let i = -shiftedPositionBoundary; i <= shiftedPositionBoundary; i++) {
    for (let j = -shiftedPositionBoundary; j <= shiftedPositionBoundary; j++) {
      availablePositions.push({
        x: i * (2 * minVertexDistance),
        y: j * (2 * minVertexDistance)
      });
    }
  }
  const selectedPositions = random.sample(availablePositions, verticesCount);

  const verticesPositions = vertices.reduce((acc, key, idx) => {
    acc[key] = selectedPositions[idx] as Vector;
    return acc;
  }, {} as PlacedVerticesPositions);

  return alignPositionsToCenter(verticesPositions);
};

const calcVerticesTriangularPositions = (
  props: CalcVerticesPositionsProps
): GraphLayout => {
  'worklet';
  const { density, minVertexDistance, vertices } = props;
  const verticesCount = vertices.length;
  const triangleHeight = (minVertexDistance * Math.sqrt(3)) / 2;

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
        (currentVertexIndex % 2 === 1 ? minVertexDistance / 2 : 0) +
        minVertexDistance * Math.floor(lineNumber / 2);
      y = currentVertexIndex * triangleHeight;
    } else {
      // Horizontal line
      x =
        ((lineNumber - 2) % 4 === 0 ? minVertexDistance / 2 : 0) +
        currentVertexIndex * minVertexDistance;
      y = Math.floor(lineNumber / 2) * triangleHeight;
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

  return alignPositionsToCenter(verticesPositions);
};

const calcVerticesRandomPositions = (
  vertices: Array<string>,
  width: number,
  height: number
): GraphLayout => {
  'worklet';
  const innerWidth = width;
  const innerHeight = height;

  const verticesPositions = vertices.reduce((acc, key) => {
    acc[key] = {
      x: (Math.random() - 0.5) * innerWidth,
      y: (Math.random() - 0.5) * innerHeight
    };
    return acc;
  }, {} as PlacedVerticesPositions);

  return alignPositionsToCenter(verticesPositions);
};

export default function placeVerticesRandomly(
  vertices: Array<string>,
  canvasDimensions: Dimensions,
  settings: AllRandomPlacementSettings
): GraphLayout {
  'worklet';
  if (settings.mesh === 'random') {
    return calcVerticesRandomPositions(
      vertices,
      settings.containerWidth ?? canvasDimensions.width,
      settings.containerHeight ?? canvasDimensions.height
    );
  }

  const props: CalcVerticesPositionsProps = {
    density: settings.density,
    minVertexDistance: settings.minVertexDistance,
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

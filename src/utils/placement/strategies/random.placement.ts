import { Vector } from '@shopify/react-native-skia';

import {
  RANDOM_PLACEMENT_SETTING,
  SHARED_PLACEMENT_SETTINGS
} from '@/constants/placement';
import { Vertex } from '@/types/graphs';
import {
  GraphLayout,
  PlacedVerticesPositions,
  RandomPlacementSettings
} from '@/types/settings';
import { zipArrays } from '@/utils/arrays';
import random from '@/utils/random';

const placeVerticesRandomly = <V, E>(
  vertices: Array<Vertex<V, E>>,
  vertexRadius: number,
  settings: RandomPlacementSettings = {} as RandomPlacementSettings
): GraphLayout => {
  if (settings.layoutType === 'random') {
    return calcVerticesRandomPositions(
      vertices,
      vertexRadius,
      settings.containerWidth,
      settings.containerHeight
    );
  }

  const props: CalcVerticesPositionsProps<V, E> = {
    vertices,
    density: settings.density || RANDOM_PLACEMENT_SETTING.density,
    minVertexSpacing:
      settings.minVertexSpacing || SHARED_PLACEMENT_SETTINGS.minVertexSpacing,
    vertexRadius
  };

  switch (settings.layoutType) {
    case 'grid':
      return calcVerticesGridPositions(props);
    case 'triangles':
      return calcVerticesTrianglesPositions(props);
  }
};

type CalcVerticesPositionsProps<V, E> = {
  vertices: Array<Vertex<V, E>>;
  density: number;
  vertexRadius: number;
  minVertexSpacing: number;
};

const calcVerticesGridPositions = <V, E>(
  props: CalcVerticesPositionsProps<V, E>
): GraphLayout => {
  const { vertices, density, vertexRadius, minVertexSpacing } = props;
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

  const containerSize =
    2 * vertexRadius +
    (minVertexSpacing + 2 * vertexRadius) * (maxPointsInLine - 1);
  const selectedPositions = random.sample(availablePositions, verticesCount);

  return {
    width: containerSize,
    height: containerSize,
    verticesPositions: vertices.reduce((acc, { key }, idx) => {
      acc[key] = selectedPositions[idx] as Vector;
      return acc;
    }, {} as PlacedVerticesPositions)
  };
};

const calcVerticesTrianglesPositions = <V, E>(
  props: CalcVerticesPositionsProps<V, E>
): GraphLayout => {
  const { vertices, density, vertexRadius, minVertexSpacing } = props;
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

  return {
    width: maxX + vertexRadius,
    height: maxY + vertexRadius,
    verticesPositions: verticesAndPositions.reduce(
      (acc, [vertex, position]) => {
        acc[vertex.key] = position;
        return acc;
      },
      {} as PlacedVerticesPositions
    )
  };
};

const calcVerticesRandomPositions = <V, E>(
  vertices: Array<Vertex<V, E>>,
  vertexRadius: number,
  width: number,
  height: number
): GraphLayout => {
  const innerWidth = width - 2 * vertexRadius;
  const innerHeight = height - 2 * vertexRadius;

  const verticesPositions = vertices.reduce((acc, { key }) => {
    acc[key] = {
      x: vertexRadius + (Math.random() - 0.5) * innerWidth,
      y: vertexRadius + (Math.random() - 0.5) * innerHeight
    };
    return acc;
  }, {} as PlacedVerticesPositions);

  return {
    width,
    height,
    verticesPositions
  };
};

export default placeVerticesRandomly;

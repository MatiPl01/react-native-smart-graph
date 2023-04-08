import { Graph, Vertex } from '@/types/graphs';
import {
  GraphLayout,
  PlacedVerticesPositions,
  RandomPlacementSettings
} from '@/types/placement';
import random from '@/utils/random';

import { RANDOM_PLACEMENT, SHARED } from '../constants';

const placeVerticesRandomly = <V, E>(
  graph: Graph<V, E>,
  {
    density = RANDOM_PLACEMENT.density,
    layoutType = RANDOM_PLACEMENT.layoutType,
    vertexRadius = SHARED.vertexRadius,
    minVertexDistance = SHARED.minVertexDistance
  }: RandomPlacementSettings = {} as RandomPlacementSettings
): GraphLayout => {
  const props: CalcVerticesPositionsProps<V, E> = {
    vertices: random.shuffle(graph.vertices),
    density,
    vertexRadius,
    minVertexDistance
  };

  switch (layoutType) {
    case 'grid':
      return calcVerticesGridPositions(props);
    case 'honeycomb':
      return calcVerticesHoneycombPositions(props);
  }
};

type CalcVerticesPositionsProps<V, E> = {
  vertices: Vertex<V, E>[];
  density: number;
  vertexRadius: number;
  minVertexDistance: number;
};

const calcVerticesGridPositions = <V, E>(
  props: CalcVerticesPositionsProps<V, E>
): GraphLayout => {
  const { vertices, density, vertexRadius, minVertexDistance } = props;
  const verticesCount = vertices.length;

  const maxPointsInLine = Math.ceil(Math.sqrt(verticesCount / density));
  const availablePositions: { x: number; y: number }[] = [];

  for (let i = 0; i < maxPointsInLine; i++) {
    for (let j = 0; j < maxPointsInLine; j++) {
      availablePositions.push({
        x: vertexRadius + i * (2 * vertexRadius + minVertexDistance),
        y: vertexRadius + j * (2 * vertexRadius + minVertexDistance)
      });
    }
  }

  const containerSize =
    2 * vertexRadius +
    (minVertexDistance + 2 * vertexRadius) * (maxPointsInLine - 1);
  const selectedPositions = random.sample(availablePositions, verticesCount);

  return {
    width: containerSize,
    height: containerSize,
    verticesPositions: vertices.reduce((acc, { key }, idx) => {
      acc[key] = selectedPositions[idx] as { x: number; y: number };
      return acc;
    }, {} as PlacedVerticesPositions)
  };
};

const calcVerticesHoneycombPositions = <V, E>(
  props: CalcVerticesPositionsProps<V, E>
): GraphLayout => {};

export default placeVerticesRandomly;

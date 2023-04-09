// TODO - improve docs later
import { Graph, Vertex } from '@/types/graphs';
import {
  GraphLayout,
  OrbitsPlacementSettings,
  PlacedVerticesPositions
} from '@/types/placement';
import { findRootVertex, isGraphATree, isGraphDirected } from '@/utils/graphs';

import { SHARED } from '../constants';

/**
 * The graph must be a tree!
 * Places vertices in a circular fashion. The root vertex is placed in the center of the circle.
 *
 * @param graph
 * @param containerWidth
 * @param containerHeight
 * @returns
 */
const placeVerticesOnOrbits = <V, E>(
  graph: Graph<V, E>,
  {
    vertexRadius = SHARED.vertexRadius,
    minVertexDistance = SHARED.minVertexDistance
  }: OrbitsPlacementSettings
): GraphLayout => {
  // TODO - maybe add undirected graph support
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on rings for undirected graph');
  }
  if (!isGraphATree(graph)) {
    throw new Error('Cannot place vertices on rings for non-tree graph');
  }

  const verticesLayerPositions: Record<
    string,
    { layer: number; angle: number }
  > = {};
  const minLayersRadius: Record<string, number> = {};

  const rootVertex = findRootVertex(graph) as Vertex<V, E>;
  const minVertexCenterDistance = 2 * vertexRadius + minVertexDistance;

  placeChildrenOnRingSection(
    rootVertex,
    0,
    0,
    2 * Math.PI,
    minVertexCenterDistance,
    minLayersRadius,
    verticesLayerPositions
  );

  const { width, height, center, layersRadius } = getLayout(
    minLayersRadius,
    minVertexDistance,
    vertexRadius
  );

  return {
    width,
    height,
    verticesPositions: Object.entries(verticesLayerPositions).reduce(
      (acc, [key, { layer, angle }]) => {
        const r = layersRadius[layer] as number;
        acc[key] = {
          x: center.x + r * Math.cos(angle),
          y: center.y + r * Math.sin(angle)
        };
        return acc;
      },
      {} as PlacedVerticesPositions
    )
  };
};

const placeChildrenOnRingSection = <V, E>(
  parent: Vertex<V, E>,
  parentLayer: number,
  parentAngle: number,
  sectionAngle: number,
  minVertexCenterDistance: number,
  minLayersRadius: Record<string, number>,
  verticesLayerPositions: Record<string, { layer: number; angle: number }>
) => {
  if (parentLayer > 0) {
    const denominator = 2 * Math.sin(sectionAngle / 2);
    const sectionRadius =
      denominator > 1e-10
        ? minVertexCenterDistance / denominator
        : minVertexCenterDistance;

    minLayersRadius[parentLayer] = Math.max(
      minLayersRadius[parentLayer] || 0,
      sectionRadius
    );
  } else {
    minLayersRadius[parentLayer] = 0;
  }

  verticesLayerPositions[parent.key] = {
    layer: parentLayer,
    angle: parentAngle
  };

  parent.neighbors.forEach((child, i) => {
    placeChildrenOnRingSection(
      child,
      parentLayer + 1,
      parentAngle -
        sectionAngle / 2 +
        (sectionAngle / parent.neighbors.length) * (i + 0.5),
      sectionAngle / parent.neighbors.length,
      minVertexCenterDistance,
      minLayersRadius,
      verticesLayerPositions
    );
  });
};

const getLayout = (
  minLayersRadius: Record<string, number>,
  minVertexDistance: number,
  vertexRadius: number
) => {
  const layersRadius = [0];

  for (let i = 1; i < Object.keys(minLayersRadius).length; i++) {
    layersRadius.push(
      Math.max(
        minLayersRadius[i] as number,
        (layersRadius[i - 1] as number) + minVertexDistance + 2 * vertexRadius
      )
    );
  }

  const containerSize =
    2 * ((layersRadius[layersRadius.length - 1] as number) + vertexRadius);

  return {
    width: containerSize,
    height: containerSize,
    center: {
      x: containerSize / 2,
      y: containerSize / 2
    },
    layersRadius
  };
};

export default placeVerticesOnOrbits;

// TODO - improve docs later
import { Graph, Vertex } from '@/types/graphs';
import {
  GraphLayout,
  OrbitsPlacementSettings,
  PlacedVerticesPositions
} from '@/types/placement';
import { findRootVertex, isGraphATree, isGraphDirected } from '@/utils/graphs';

import { DEFAULTS } from '../constants';

// TODO - improve orbits radius calculation (based on the number of vertices placed on each orbit and angles between them)

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
    vertexRadius = DEFAULTS.vertexRadius,
    minVertexDistance = DEFAULTS.minVertexDistance
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

  const rootVertex = findRootVertex(graph) as Vertex<V, E>;

  placeChildrenOnRingSection(
    rootVertex,
    0,
    0,
    2 * Math.PI,
    verticesLayerPositions
  );

  const totalLayers = Math.max(
    ...Object.values(verticesLayerPositions).map(({ layer }) => layer)
  );

  const { center, maxRadius, width, height } = getLayout(
    vertexRadius,
    minVertexDistance,
    totalLayers
  );

  return {
    width,
    height,
    verticesPositions: Object.entries(verticesLayerPositions).reduce(
      (acc, [key, { layer, angle }]) => {
        const r = (layer / totalLayers) * maxRadius;
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
  verticesLayerPositions: Record<string, { layer: number; angle: number }>
) => {
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
      verticesLayerPositions
    );
  });
};

const getLayout = (
  vertexRadius: number,
  minVertexDistance: number,
  layersCount: number
) => {
  let height, maxRadius, width;

  if (layersCount === 0) {
    width = height = vertexRadius * 2;
    maxRadius = 0;
  } else {
    width = height = 2 * layersCount * (2 * vertexRadius + minVertexDistance);
    maxRadius = Math.min(width, height) / 2 - vertexRadius;
  }

  return {
    width,
    height,
    maxRadius,
    center: {
      x: width / 2,
      y: height / 2
    }
  };
};

export default placeVerticesOnOrbits;

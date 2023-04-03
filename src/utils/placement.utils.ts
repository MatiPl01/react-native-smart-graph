import { DirectedGraph } from '@/models/graphs';
import { Graph, Vertex } from '@/types/graphs';
import { PlacementStrategy } from '@/types/placement';
import { isGraphConnected, isGraphDirected } from '@/utils/graphs.utils';

export const placeVertices = <V, E>(
  graph: Graph<V, E>,
  width: number,
  height: number,
  placementStrategy: PlacementStrategy
): Record<string, { x: number; y: number }> => {
  switch (placementStrategy) {
    case 'random':
      return placeVerticesRandomly(graph, width, height);
    // case 'circular':
    //   return placeVerticesCircular(graph, width, height);
    case 'rings':
    default: // TODO - add more strategies
      return placeVerticesOnRings(graph, width, height);
  }
};

const placeVerticesRandomly = <V, E>(
  graph: Graph<V, E>,
  width: number,
  height: number
) => {
  const verticesPositions: Record<string, { x: number; y: number }> = {};

  graph.vertices.forEach(v => {
    verticesPositions[v.key] = {
      x: Math.random() * width,
      y: Math.random() * height
    };
  });

  return verticesPositions;
};

const findRootVertex = <V, E>(
  graph: DirectedGraph<V, E>
): Vertex<V, E> | undefined => {
  const rootVertices = graph.vertices.filter(v => v.inDegree === 0);

  if (rootVertices.length > 1) {
    throw new Error('Multiple root vertices found');
  }
  if (rootVertices.length === 0) {
    throw new Error('No root vertices found');
  }

  return rootVertices[0];
};

/**
 * The graph must be a tree!
 * Places vertices in a circular fashion. The root vertex is placed in the center of the circle.
 *
 * @param graph
 * @param width
 * @param height
 * @returns
 */
const placeVerticesOnRings = <V, E>(
  graph: Graph<V, E>,
  width: number,
  height: number
): Record<string, { x: number; y: number }> => {
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on rings for undirected graph');
  }
  if (!isGraphConnected(graph)) {
    throw new Error('Cannot place vertices on rings for disconnected graph');
  }

  const verticesPositionCoordinates: Record<
    string,
    { layer: number; angle: number }
  > = {};

  const rootVertex = findRootVertex(graph) as Vertex<V, E>;

  placeChildrenOnRingSection(
    rootVertex,
    0,
    0,
    2 * Math.PI,
    verticesPositionCoordinates
  );

  const totalLayers = Math.max(
    ...Object.values(verticesPositionCoordinates).map(({ layer }) => layer)
  );
  const maxRadius = Math.min(width, height) / 2;
  const center = {
    x: width / 2,
    y: height / 2
  };

  const verticesPositions: Record<string, { x: number; y: number }> = {};
  Object.entries(verticesPositionCoordinates).forEach(
    ([key, { layer, angle }]) => {
      const r = (layer / totalLayers) * maxRadius;
      verticesPositions[key] = {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      };
    }
  );

  return verticesPositions;
};

const placeChildrenOnRingSection = <V, E>(
  parent: Vertex<V, E>,
  parentLayer: number,
  parentAngle: number,
  sectionAngle: number,
  verticesPositionCoordinates: Record<string, { layer: number; angle: number }>
) => {
  verticesPositionCoordinates[parent.key] = {
    layer: parentLayer,
    angle: parentAngle
  };

  parent.neighbours.forEach((child, i) => {
    placeChildrenOnRingSection(
      child,
      parentLayer + 1,
      parentAngle -
        sectionAngle / 2 +
        (sectionAngle / parent.neighbours.length) * (i + 0.5),
      sectionAngle / parent.neighbours.length,
      verticesPositionCoordinates
    );
  });
};

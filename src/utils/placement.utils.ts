import { Graph, Vertex } from '@/types/graphs';
import {PlacementStrategy} from '@/types/placement';
import {DirectedGraph} from '@/models/graphs';
import {isGraphDirected} from '@/utils/graphs.utils';
import {useSharedValue} from 'react-native-reanimated';

export const placeVertices = <V, E>(
    graph: Graph<V, E>,
    width: number,
    height: number,
    placementStrategy: PlacementStrategy
): Record<string, { x: number; y: number }> => {
  switch (placementStrategy) {
    case 'random':
      return placeVerticesRandomly(graph, width, height);
    case 'circular':
      return placeVerticesCircular(graph, width, height);
    case 'rings':
      return placeVerticesOnRings()
  }
}

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

const findRootVertex = <V, E>(graph: DirectedGraph<V, E>): Vertex<V, E> | undefined => {
    return graph.vertices.find(v => v.inDegree === 0);
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
) => {
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on rings for undirected graph');
  }

  const radius = Math.min(width, height) / 2;
  const center = {
    x: width / 2,
    y: height / 2
  };

  const rootVertex = findRootVertex(graph);
  if (!rootVertex) {
    throw new Error('Cannot find root vertex');
  }

  const sections = rootVertex?.edges.length || 0;
  const angle = (2 * Math.PI) / sections;

  const verticesPositions: Record<string, { layer: number, angle: number }> = {};
  let totalLayers = 0;

  rootVertex.neighbours.forEach((v, i) => {
    // put v in the middle of i-th section
    verticesPositions[v.key] = {
        layer: 1,
        angle: angle * i + angle / 2
    };
    // place its children in the section using bfs
    placeChildrenOnRingSection(v, i, 2, angle, verticesPositions);
  });



  return verticesPositions;
};

const placeChildrenOnRingSection = <V, E>(v: Vertex<V, E>, section: number, layer: number, angle: number, verticesPositions: Record<string, { layer: number, angle: number }>) => {
    const children = v.neighbours.filter(c => !verticesPositions[c.key]);
    const childrenCount = children.length;
    const childrenAngle = angle / childrenCount;
    children.forEach((c, i) => {
        verticesPositions[c.key] = {
            layer: layer,
            angle: section * angle + childrenAngle * i + childrenAngle / 2
        };
    });

    children.forEach(c => placeChildrenOnRingSection(c, section, layer + 1, angle, verticesPositions));
}

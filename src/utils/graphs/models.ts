import { DirectedGraph } from '@/models/graphs';
import {
  DirectedEdge,
  DirectedGraphVertex,
  Edge,
  Graph,
  UndirectedEdge,
  Vertex
} from '@/types/graphs';

export const findRootVertex = <V, E>(
  graph: DirectedGraph<V, E>
): Vertex<V, E> | undefined => {
  const rootVertices = graph.vertices.filter(
    v => v.inDegree === 0 && v.outDegree > 0
  );

  if (rootVertices.length > 1) {
    throw new Error('Multiple root vertices found');
  }
  if (rootVertices.length === 0) {
    throw new Error('No root vertices found');
  }

  return rootVertices[0];
};

export const isGraphDirected = <V, E>(
  graph: Graph<V, E>
): graph is DirectedGraph<V, E> => graph.isDirected();

export const isGraphConnected = <V, E>(graph: Graph<V, E>): boolean => {
  if (graph.vertices.length <= 1) {
    return true;
  }

  const visited: Record<string, boolean> = {};
  const stack: Array<Vertex<V, E>> = [graph.vertices[0] as Vertex<V, E>];

  while (stack.length > 0) {
    const vertex = stack.pop() as Vertex<V, E>;
    visited[vertex.key] = true;
    vertex.neighbors.forEach(neighbor => {
      if (!visited[neighbor.key]) {
        stack.push(neighbor);
      }
    });
  }

  return Object.keys(visited).length === graph.vertices.length;
};

export const isGraphAcyclic = <V, E>(graph: Graph<V, E>): boolean => {
  if (graph.vertices.length <= 1) {
    return true;
  }

  const visited: Record<string, boolean> = {};
  const stack: Array<Vertex<V, E>> = [graph.vertices[0] as Vertex<V, E>];

  while (stack.length > 0) {
    const vertex = stack.pop() as Vertex<V, E>;
    visited[vertex.key] = true;
    for (const neighbor of vertex.neighbors) {
      if (visited[neighbor.key]) {
        return false;
      }
      stack.push(neighbor);
    }
  }

  return true;
};

export const isGraphATree = <V, E>(graph: Graph<V, E>): boolean => {
  return isGraphConnected(graph) && isGraphAcyclic(graph);
};

export const isEdgeDirected = <V, E>(
  edge: Edge<E, V>
): edge is DirectedEdge<E, V> => edge.isDirected();

export const isEdgeUndirected = <V, E>(
  edge: Edge<E, V>
): edge is UndirectedEdge<E, V> => !isEdgeDirected(edge);

export const getOrphanedVertices = <V, E>(
  vertices: DirectedGraphVertex<V, E>[]
) => vertices.filter(vertex => vertex.inDegree === 0 && vertex.outDegree === 0);

export const getBallancingOrphanedNeighbours = <V, E>(
  rootVertex: DirectedGraphVertex<V, E>,
  orphanedVertices: DirectedGraphVertex<V, E>[]
): Record<string, Array<DirectedGraphVertex<V, E>>> => {
  let layerVertices = [rootVertex];
  let layer = 0;
  const layerMaxChildrenCount = {} as Record<number, number>;
  const orphanedNeighbours = {} as Record<
    string,
    Array<DirectedGraphVertex<V, E>>
  >;

  while (orphanedVertices.length > 0) {
    const newLayerVertices = layerVertices.flatMap(vertex => vertex.neighbors);
    layerMaxChildrenCount[layer] = layerVertices.reduce(
      (acc, vertex) => Math.max(acc, vertex.neighbors.length),
      2
    );

    for (const vertex of layerVertices) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (vertex.neighbors.length < layerMaxChildrenCount[layer]!) {
        const chosenVertices = orphanedVertices.splice(
          0,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          layerMaxChildrenCount[layer]! - vertex.neighbors.length
        );

        orphanedNeighbours[vertex.key] = chosenVertices;
        newLayerVertices.push(...chosenVertices);
      }
    }

    layerVertices = newLayerVertices;
    layer++;
  }

  return orphanedNeighbours;
};

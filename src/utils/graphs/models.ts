import { DirectedGraph } from '@/models/graphs';
import {
  DirectedEdge,
  DirectedGraphVertex,
  Edge,
  Graph,
  UndirectedEdge,
  Vertex
} from '@/types/graphs';
import { findGraphCenter } from '@/utils/algorithms';

// TODO - remove unused functions later

export const getRootVertex = <V, E>(
  graph: DirectedGraph<V, E>
): DirectedGraphVertex<V, E> | null => {
  const rootVertices = findRootVertices(graph);

  if (rootVertices.length > 1) {
    throw new Error('Multiple root vertices found');
  }
  if (rootVertices.length === 0) {
    return null;
  }
  if (!rootVertices[0]) {
    throw new Error('Root vertex is undefined');
  }

  return rootVertices[0];
};

export const findRootVertices = <V, E>(
  graph: DirectedGraph<V, E>
): Array<DirectedGraphVertex<V, E>> => {
  return graph.vertices.filter(v => v.inDegree === 0 && v.outDegree > 0);
};

export const findRootVertex = <V, E>(
  graphComponent: Array<Vertex<V, E>>,
  selectedRootVertexKeys: Set<string>,
  isGraphDirected: boolean
): Vertex<V, E> => {
  // Find the root vertex of the component
  // 1. If there are selected root vertices, look for the root vertex among them
  for (const vertex of graphComponent) {
    if (selectedRootVertexKeys.has(vertex.key)) {
      return vertex;
    }
  }
  // 2. If the graph is undirected, select the center of the graph diameter
  // as the root vertex
  if (!isGraphDirected) {
    return findGraphCenter(graphComponent);
  }
  // 3. If the graph is directed, select the vertex with the highest out degree
  // as the root vertex
  return findDirectedGraphSourceVertex(
    graphComponent as Array<DirectedGraphVertex<V, E>>
  );
};

const findDirectedGraphSourceVertex = <V, E>(
  graphComponent: Array<DirectedGraphVertex<V, E>>
): DirectedGraphVertex<V, E> => {
  let vertices = graphComponent.filter(
    v => v.inDegree === 0 && v.outDegree > 0
  );
  if (vertices.length === 0) {
    vertices = graphComponent;
  }

  return vertices.reduce((sourceVertex, vertex) => {
    if (vertex.outDegree > sourceVertex.outDegree) {
      return vertex;
    }
    return sourceVertex;
  }, vertices[0]!);
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
  vertices: Array<DirectedGraphVertex<V, E>>
) => vertices.filter(vertex => vertex.inDegree === 0 && vertex.outDegree === 0);

export const getBalancingOrphanedNeighbors = <V, E>(
  rootVertices: Array<DirectedGraphVertex<V, E>>,
  orphanedVertices: Array<DirectedGraphVertex<V, E>>
): Record<string, Array<DirectedGraphVertex<V, E>>> => {
  let layerVertices = [...rootVertices];
  let layer = 0;
  const layerMaxChildrenCount = {} as Record<number, number>;
  const orphanedNeighbours = {} as Record<
    string,
    Array<DirectedGraphVertex<V, E>>
  >;

  let i = 0;
  while (i < orphanedVertices.length) {
    const newLayerVertices = layerVertices.flatMap(vertex => vertex.neighbors);
    layerMaxChildrenCount[layer] = layerVertices.reduce(
      (acc, vertex) => Math.max(acc, vertex.neighbors.length),
      2
    );

    for (const vertex of layerVertices) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (vertex.neighbors.length < layerMaxChildrenCount[layer]!) {
        const nOfVerticesToChoose =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          layerMaxChildrenCount[layer]! - vertex.neighbors.length;
        const chosenVertices = orphanedVertices.slice(
          i,
          i + nOfVerticesToChoose
        );
        i += nOfVerticesToChoose;

        orphanedNeighbours[vertex.key] = chosenVertices;
        newLayerVertices.push(...chosenVertices);
      }
    }

    layerVertices = newLayerVertices;
    layer++;
  }

  return orphanedNeighbours;
};

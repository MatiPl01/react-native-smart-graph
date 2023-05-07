import { DirectedGraph } from '@/models/graphs';
import {
  DirectedEdge,
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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DirectedGraphVertex, Vertex } from '@/types/graphs';
import { findGraphCenter } from '@/utils/algorithms';

// TODO - remove unused functions later

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

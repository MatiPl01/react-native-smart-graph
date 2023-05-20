import { Vector } from '@shopify/react-native-skia';

import { DirectedEdge, Edge, Graph, UndirectedEdge } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';

import {
  animatedVectorToVector,
  distanceBetweenPointAndSegment,
  distanceBetweenVectors
} from '../vectors';

export const findClosestVertex = (
  position: Vector,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): { key: string | null; distance: number } => {
  let closestVertexKey: string | null = null;
  let closestVertexDistance = Infinity;

  Object.entries(animatedVerticesPositions).forEach(
    ([key, animatedPosition]) => {
      const distance = distanceBetweenVectors(
        position,
        animatedVectorToVector(animatedPosition)
      );
      if (distance < closestVertexDistance) {
        closestVertexKey = key;
        closestVertexDistance = distance;
      }
    }
  );

  return {
    key: closestVertexKey,
    distance: closestVertexDistance
  };
};

export const findPressedVertex = (
  position: Vector,
  vertexRadius: number,
  hitSlop: number,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): string | null => {
  const { key: closestVertexKey, distance } = findClosestVertex(
    position,
    animatedVerticesPositions
  );

  if (closestVertexKey && distance <= vertexRadius + hitSlop) {
    return closestVertexKey;
  }

  return null;
};

// TODO - fix edge press handlers
export const findClosestEdge = <E, V>(
  position: Vector,
  edges: Array<Edge<E, V>>,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): { key: string | null; distance: number } => {
  let closestEdgeKey: string | null = null;
  let closestEdgeDistance = Infinity;

  edges.forEach(edge => {
    const [vertex1, vertex2] = edge.vertices;
    const vertex1Position = animatedVectorToVector(
      animatedVerticesPositions[vertex1.key]
    );
    const vertex2Position = animatedVectorToVector(
      animatedVerticesPositions[vertex2.key]
    );

    const distance = distanceBetweenPointAndSegment(
      position,
      vertex1Position,
      vertex2Position
    );

    if (distance < closestEdgeDistance) {
      closestEdgeKey = edge.key;
      closestEdgeDistance = distance;
    }
  });

  return {
    key: closestEdgeKey,
    distance: closestEdgeDistance
  };
};

export const findPressedEdge = <E, V>(
  position: Vector,
  graph: Graph<V, E>,
  hitSlop: number,
  animatedVerticesPositions: Record<string, AnimatedVectorCoordinates>
): string | null => {
  const { key: closestEdgeKey, distance } = findClosestEdge(
    position,
    graph.edges,
    animatedVerticesPositions
  );

  if (closestEdgeKey) {
    const edge = graph.edge(closestEdgeKey);
    if (edge && distance <= hitSlop) {
      return closestEdgeKey;
    }
  }

  return null;
};

const getDirectedEdgeIndex = <E, V>(
  edge: DirectedEdge<E, V>,
  edges: Array<DirectedEdge<E, V>>
): number => {
  let index = 0;
  for (const e of edges) {
    if (e.key === edge.key) {
      break;
    }
    if (e.source.key === edge.source.key && e.target.key === edge.target.key) {
      index++;
    }
  }
  return index;
};

const getUndirectedEdgeIndex = <E, V>(
  edge: UndirectedEdge<E, V>,
  edges: Array<UndirectedEdge<E, V>>
): number => edges.findIndex(e => e.key === edge.key);

export const getEdgeIndex = <E, V, GE extends Edge<E, V>>(
  edge: GE,
  edges: Array<GE>
): number => {
  const res = edge.isDirected()
    ? getDirectedEdgeIndex(
        edge as unknown as DirectedEdge<E, V>,
        edges as unknown as Array<DirectedEdge<E, V>>
      )
    : getUndirectedEdgeIndex(
        edge as unknown as UndirectedEdge<E, V>,
        edges as unknown as Array<UndirectedEdge<E, V>>
      );

  console.log(
    edge.key,
    res,
    edges.map(
      e => `${e.key} ${e.vertices[0].key === edge.vertices[0].key ? 's' : 'o'}`
    )
  );

  return res;
};

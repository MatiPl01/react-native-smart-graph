/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Queue from '@/data/Queue';
import { Vertex } from '@/types/graphs';

export const bfs = <V, E>(
  startVertices: Array<Vertex<V, E>>,
  callback: (data: {
    vertex: Vertex<V, E>;
    parent: Vertex<V, E> | null;
    startVertex: Vertex<V, E>;
    depth: number;
  }) => boolean
): Record<string, Vertex<V, E> | null> => {
  const parents: Record<string, Vertex<V, E> | null> = {};

  for (const sv of startVertices) {
    const queue = new Queue<{
      vertex: Vertex<V, E>;
      parent: Vertex<V, E> | null;
      depth: number;
    }>();
    queue.enqueue({ vertex: sv, parent: null, depth: 0 });

    while (!queue.isEmpty()) {
      const { vertex, parent, depth } = queue.dequeue() as {
        vertex: Vertex<V, E>;
        parent: Vertex<V, E>;
        depth: number;
      };
      if (parents[vertex.key] !== undefined) {
        continue;
      }
      parents[vertex.key] = parent;
      if (callback({ vertex, parent, depth, startVertex: sv })) {
        return parents;
      }
      vertex.edges.forEach(edge => {
        const nextVertex = edge.vertices.find(v => v.key !== vertex.key);
        if (nextVertex) {
          queue.enqueue({
            vertex: nextVertex,
            parent: vertex,
            depth: depth + 1
          });
        }
      });
    }
  }

  return parents;
};

export const findGraphComponents = <V, E>(
  vertices: Array<Vertex<V, E>>
): Array<Array<Vertex<V, E>>> => {
  const components: Record<string, Array<Vertex<V, E>>> = {};

  bfs(vertices, ({ vertex, startVertex }) => {
    if (!components[startVertex.key]) {
      components[startVertex.key] = [];
    }
    components[startVertex.key]!.push(vertex);
    return false;
  });

  return Object.values(components);
};

export const findGraphDiameter = <V, E>(
  graphComponent: Array<Vertex<V, E>>
): { diameter: number; path: Array<Vertex<V, E>> } => {
  // Start from the last vertex in the component (it always will be
  // the farthest vertex from the vertex where BFS started as it
  // was inserted last)
  const startVertex = graphComponent[graphComponent.length - 1]!;

  // Find the farthest vertex from the start vertex and the path
  // between them
  let farthestDistance = -1;
  let farthestVertex: Vertex<V, E> | null = null;

  const parents = bfs([startVertex], ({ vertex, depth }) => {
    if (depth > farthestDistance) {
      farthestDistance = depth;
      farthestVertex = vertex;
    }
    return false;
  });

  // Find the path between the start vertex and the farthest vertex
  const path: Array<Vertex<V, E>> = [];

  let currentVertex = farthestVertex as Vertex<V, E> | null;

  while (currentVertex) {
    path.push(currentVertex);
    currentVertex = parents[currentVertex.key] as Vertex<V, E> | null;
  }

  return {
    diameter: farthestDistance,
    path
  };
};

export const findGraphCenter = <V, E>(
  graphComponent: Array<Vertex<V, E>>
): Vertex<V, E> => {
  const { path, diameter } = findGraphDiameter(graphComponent);
  return path[Math.floor(diameter / 2)]!;
};

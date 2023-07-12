/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createQueue } from '@/data/Queue';
import { GraphConnections, Vertex } from '@/types/graphs';

export const bfs = (
  connections: GraphConnections,
  startVertices: Array<string>,
  callback: (data: {
    depth: number;
    parent: null | string;
    startVertex: string;
    vertex: string;
  }) => boolean
): Record<string, null | string> => {
  'worklet';
  const parents: Record<string, null | string> = {};

  for (const sv of startVertices) {
    const queue = createQueue<{
      depth: number;
      key: string;
      parent: null | string;
    }>();
    queue.enqueue({ depth: 0, key: sv, parent: null });
    while (!queue.isEmpty()) {
      const { depth, key, parent } = queue.dequeue() as {
        depth: number;
        key: string;
        parent: string;
      };
      if (parents[key] !== undefined) {
        continue;
      }
      parents[key] = parent;
      if (callback({ depth, parent, startVertex: sv, vertex: key })) {
        return parents;
      }
      const neighbors = connections[key];
      neighbors?.forEach(neighbor => {
        queue.enqueue({
          depth: depth + 1,
          key: neighbor,
          parent: key
        });
      });
    }
  }

  return parents;
};

export const findGraphComponents = (
  connections: GraphConnections
): Array<Array<string>> => {
  'worklet';
  const components: Record<string, Array<string>> = {};

  bfs(connections, Object.keys(connections), ({ startVertex, vertex }) => {
    if (!components[startVertex]) {
      components[startVertex] = [];
    }
    components[startVertex]!.push(vertex);
    return false;
  });

  console.log(components);

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

  const parents = bfs([startVertex], ({ depth, vertex }) => {
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
  const { diameter, path } = findGraphDiameter(graphComponent);
  return path[Math.floor(diameter / 2)]!;
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createQueue } from '@/data/Queue';
import {
  GraphComponent,
  GraphComponents,
  GraphConnections
} from '@/types/graphs';

export const bfs = (
  connections: GraphConnections,
  startVertices: Array<string>,
  callback: (data: {
    depth: number;
    parent: null | string;
    startVertex: string;
    vertex: string;
  }) => boolean | void
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
      connections[key]?.outgoing?.forEach(neighbor => {
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

// NOTE: This is an iterative post-order DFS implementation
export const dfs = (
  connections: GraphConnections,
  startVertices: Array<string>,
  callback: (data: {
    depth: number;
    parent: null | string;
    startVertex: string;
    vertex: string;
  }) => boolean | void
): Record<string, null | string> => {
  'worklet';
  const parents: Record<string, null | string> = {};
  const depths: Record<string, number> = {};

  for (const sv of startVertices) {
    const stack: Array<{
      depth: number;
      key: string;
      parent: null | string;
    }> = [];
    stack.push({ depth: 0, key: sv, parent: null });

    const visited: Record<string, boolean> = {};
    const postOrder = [];

    while (stack.length) {
      const node = stack[stack.length - 1]!;
      const { key } = node;
      if (!visited[key]) {
        visited[key] = true;
        postOrder.push(node);

        const neighbors = connections[key]?.outgoing ?? [];
        for (const neighbor of neighbors) {
          if (!visited[neighbor]) {
            stack.push({
              depth: node.depth + 1,
              key: neighbor,
              parent: key
            });
          }
        }
      } else {
        stack.pop();
      }
    }

    while (postOrder.length) {
      const { depth, key, parent } = postOrder.pop()!;
      if (parents[key] !== undefined) {
        continue;
      }
      parents[key] = parent;
      depths[key] = depth;
      if (callback({ depth, parent, startVertex: sv, vertex: key })) {
        return parents;
      }
    }
  }

  return parents;
};

const findGraphDiameter = (
  connections: GraphConnections,
  graphComponent: GraphComponent
): { diameter: number; path: Array<string> } => {
  'worklet';
  // Start from the last vertex in the component (it always will be
  // the farthest vertex from the vertex where BFS started as it
  // was inserted last)
  const startVertex = graphComponent[graphComponent.length - 1]!;

  // Find the farthest vertex from the start vertex and the path
  // between them
  let farthestDistance = -1;
  let farthestVertex: null | string = null;

  const parents = bfs(connections, [startVertex], ({ depth, vertex }) => {
    if (depth > farthestDistance) {
      farthestDistance = depth;
      farthestVertex = vertex;
    }
    return false;
  });

  // Find the path between the start vertex and the farthest vertex
  const path: Array<string> = [];

  let currentVertex = farthestVertex as null | string;

  while (currentVertex) {
    path.push(currentVertex);
    currentVertex = parents[currentVertex] as null | string;
  }

  return {
    diameter: farthestDistance,
    path
  };
};

export const findGraphComponents = (
  connections: GraphConnections
): GraphComponents => {
  'worklet';
  const components: Record<string, GraphComponent> = {};

  bfs(connections, Object.keys(connections), ({ startVertex, vertex }) => {
    if (!components[startVertex]) {
      components[startVertex] = [];
    }
    components[startVertex]!.push(vertex);
  });

  return Object.values(components);
};

export const findGraphCenter = (
  connections: GraphConnections,
  graphComponent: GraphComponent
): string => {
  'worklet';
  const { diameter, path } = findGraphDiameter(connections, graphComponent);
  return path[Math.floor(diameter / 2)]!;
};

const findDirectedGraphSourceVertex = (
  connections: GraphConnections,
  graphComponent: Array<string>
): string => {
  'worklet';
  let vertices = graphComponent.filter(
    v => connections[v]?.incoming?.length === 0
  );
  if (vertices.length === 0) {
    vertices = graphComponent;
  }

  return vertices.reduce((sourceVertex, vertex) => {
    if (
      connections[vertex]!.outgoing.length >
      connections[sourceVertex]!.outgoing.length
    ) {
      return vertex;
    }
    return sourceVertex;
  }, vertices[0]!);
};

export const findRootVertex = (
  connections: GraphConnections,
  graphComponent: GraphComponent,
  selectedRootVertexKeys: Set<string>,
  isGraphDirected: boolean
): string => {
  'worklet';
  // Find the root vertex of the component
  // 1. If there are selected root vertices, look for the root vertex among them
  for (const key of graphComponent) {
    if (selectedRootVertexKeys.has(key)) {
      return key;
    }
  }
  // 2. If the graph is undirected, select the center of the graph diameter
  // as the root vertex
  if (!isGraphDirected) {
    return findGraphCenter(connections, graphComponent);
  }
  // 3. If the graph is directed, select the vertex with the highest out degree
  // as the root vertex
  return findDirectedGraphSourceVertex(connections, graphComponent);
};

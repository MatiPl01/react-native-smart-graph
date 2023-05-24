import Queue from '@/data/Queue';
import { Graph, Vertex } from '@/types/graphs';

const bfs = <V, E>(
  graph: Graph<V, E>,
  callback: (data: {
    vertex: Vertex<V, E>;
    parent: Vertex<V, E> | null;
    startVertex: Vertex<V, E>;
    depth: number;
  }) => boolean,
  startVertex?: string
): Record<string, Vertex<V, E> | null> => {
  const parents: Record<string, Vertex<V, E> | null> = {};
  const startVertexNode = startVertex && graph.vertex(startVertex);
  const startVertices = startVertexNode ? [startVertexNode] : graph.vertices;

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
  graph: Graph<V, E>
): Array<Array<Vertex<V, E>>> => {
  const components: Record<string, Array<Vertex<V, E>>> = {};

  bfs(graph, ({ vertex, startVertex }) => {
    if (!components[startVertex.key]) {
      components[startVertex.key] = [];
    }
    components[startVertex.key]!.push(vertex);
    return false;
  });

  return Object.values(components);
};

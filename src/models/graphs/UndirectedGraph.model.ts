import UndirectedEdge from '@/models/edges/UndirectedEdge.model';
import UndirectedGraphVertex from '@/models/vertices/UndirectedGraphVertex.model';

import Graph from './Graph.model';

export default class UndirectedGraph<V, E> extends Graph<
  V,
  E,
  UndirectedGraphVertex<V, E>,
  UndirectedEdge<E, V>
> {
  insertVertex(key: string, value: V): UndirectedGraphVertex<V, E> {
    return this.insertVertexObject(new UndirectedGraphVertex<V, E>(key, value));
  }

  override insertEdge(
    vertex1key: string,
    vertex2key: string,
    edgeKey: string,
    value: E
  ): UndirectedEdge<E, V> {
    return this.insertEdgeObject(
      new UndirectedEdge<E, V>(edgeKey, value, [
        this.vertex(vertex1key),
        this.vertex(vertex2key)
      ])
    );
  }

  override removeEdge(key: string): UndirectedEdge<E, V> {
    const edge = this.edge(key);

    edge.vertices[0].removeEdge(key);
    edge.vertices[1].removeEdge(key);
    delete this.edges$[key];

    return edge;
  }
}

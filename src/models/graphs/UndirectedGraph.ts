import UndirectedEdge from '../edges/UndirectedEdge';
import UndirectedGraphVertex from '../vertices/UndirectedGraphVertex';
import Graph from './Graph';

export default class UndirectedGraph<V, E> extends Graph<
  V,
  E,
  UndirectedGraphVertex<V, E>,
  UndirectedEdge<E, V>
> {
  isDirected() {
    return false;
  }

  insertVertex(
    key: string,
    value: V,
    radius: number
  ): UndirectedGraphVertex<V, E> {
    return this.insertVertexObject(
      new UndirectedGraphVertex<V, E>(key, value, radius)
    );
  }

  override insertEdge(
    vertex1key: string,
    vertex2key: string,
    edgeKey: string,
    value: E
  ): UndirectedEdge<E, V> {
    const vertex1 = this.vertex(vertex1key);
    const vertex2 = this.vertex(vertex2key);

    const edge = new UndirectedEdge<E, V>(edgeKey, value, [vertex1, vertex2]);
    this.insertEdgeObject(edge);

    vertex1.addEdge(edge);
    if (vertex1key !== vertex2key) {
      vertex2.addEdge(edge);
    }

    return edge;
  }

  override removeEdge(key: string): E {
    const edge = this.edge(key);

    edge.vertices[0].removeEdge(key);
    if (!edge.isLoop) {
      edge.vertices[1].removeEdge(key);
    }
    delete this.edges$[key];

    return edge.value;
  }
}

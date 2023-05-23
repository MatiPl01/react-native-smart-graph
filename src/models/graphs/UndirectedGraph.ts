import UndirectedEdge from '../edges/UndirectedEdge';
import UndirectedGraphVertex from '../vertices/UndirectedGraphVertex';
import Graph from './Graph';

export default class UndirectedGraph<V, E> extends Graph<
  V,
  E,
  UndirectedGraphVertex<V, E>,
  UndirectedEdge<E, V>
> {
  // eslint-disable-next-line no-shadow
  static fromData<V, E>(
    vertices: Array<{ key: string; data: V }>,
    edges?: Array<{ key: string; vertices: [string, string]; data: E }>
  ): UndirectedGraph<V, E> {
    const instance = new UndirectedGraph<V, E>();

    vertices.forEach(({ key, data }) => instance.insertVertex(key, data));
    edges?.forEach(({ key, vertices: [v1, v2], data }) =>
      instance.insertEdge(key, data, v1, v2, false)
    );
    instance.notifyChange();

    return instance;
  }

  override isDirected() {
    return false;
  }

  override insertVertex(key: string, value: V): UndirectedGraphVertex<V, E> {
    return this.insertVertexObject(new UndirectedGraphVertex<V, E>(key, value));
  }

  override insertEdge(
    key: string,
    value: E,
    vertex1key: string,
    vertex2key: string,
    notifyObservers?: boolean
  ): UndirectedEdge<E, V> {
    const vertex1 = this.vertex(vertex1key);
    const vertex2 = this.vertex(vertex2key);

    if (!vertex1) {
      throw new Error(`Vertex ${vertex1key} does not exist`);
    }
    if (!vertex2) {
      throw new Error(`Vertex ${vertex2key} does not exist`);
    }

    const edge = new UndirectedEdge<E, V>(key, value, [vertex1, vertex2]);

    vertex1.addEdge(edge);
    if (vertex1key !== vertex2key) {
      vertex2.addEdge(edge);
    }
    this.insertEdgeObject(edge, notifyObservers);

    return edge;
  }

  override removeEdge(key: string, notifyObservers?: boolean): E {
    const edge = this.edge(key);

    if (!edge) {
      throw new Error(`Edge ${key} does not exist`);
    }

    edge.vertices[0].removeEdge(key);
    if (!edge.isLoop) {
      edge.vertices[1].removeEdge(key);
    }
    this.removeEdgeObject(edge, notifyObservers);

    return edge.value;
  }

  override orderEdgesBetweenVertices(
    edges: Array<UndirectedEdge<E, V>>
  ): Array<{ edge: UndirectedEdge<E, V>; order: number }> {
    return edges.map((edge, index) => ({
      edge,
      order: index
    }));
  }
}

import { UndirectedEdgeData, VertexData } from '@/types/data';

import UndirectedEdge from '../edges/UndirectedEdge';
import UndirectedGraphVertex from '../vertices/UndirectedGraphVertex';
import Graph from './Graph';

export default class UndirectedGraph<V, E> extends Graph<
  V,
  E,
  UndirectedGraphVertex<V, E>,
  UndirectedEdge<E, V>,
  UndirectedEdgeData<E>
> {
  // eslint-disable-next-line no-shadow
  static fromData<V, E>(
    vertices: Array<VertexData<V>>,
    edges?: Array<UndirectedEdgeData<E>>
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

  override insertVertex(
    key: string,
    value: V,
    notifyObservers = true
  ): UndirectedGraphVertex<V, E> {
    return this.insertVertexObject(
      new UndirectedGraphVertex<V, E>(key, value),
      notifyObservers
    );
  }

  override insertEdge(
    key: string,
    value: E,
    vertex1key: string,
    vertex2key: string,
    notifyObservers = true
  ): UndirectedEdge<E, V> {
    const vertex1 = this.getVertex(vertex1key);
    const vertex2 = this.getVertex(vertex2key);

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

  override removeEdge(key: string, notifyObservers = true): E {
    const edge = this.getEdge(key);

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

  override insertBatch(
    batchData: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<UndirectedEdgeData<E>>;
    },
    notifyObservers = true
  ): void {
    // Insert edges and vertices to the graph model
    batchData.vertices?.forEach(({ key, data }) =>
      this.insertVertex(key, data, false)
    );
    batchData.edges?.forEach(({ key, data, vertices }) =>
      this.insertEdge(key, data, ...vertices, false)
    );
    // Notify observers after all changes to the graph model are made
    if (notifyObservers) {
      this.notifyChange();
    }
  }

  override replaceBatch(
    batchData: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<UndirectedEdgeData<E>>;
    },
    notifyObservers = true
  ): void {
    this.clear();
    setTimeout(() => {
      this.insertBatch(batchData, notifyObservers);
    }, 0);
  }
}

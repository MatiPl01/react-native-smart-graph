import DirectedEdge from '../edges/DirectedEdge';
import DirectedGraphVertex from '../vertices/DirectedGraphVertex';
import Graph from './Graph';

export default class DirectedGraph<V, E> extends Graph<
  V,
  E,
  DirectedGraphVertex<V, E>,
  DirectedEdge<E, V>
> {
  // eslint-disable-next-line no-shadow
  static fromData<V, E>(
    vertices: Array<{ key: string; data: V }>,
    edges?: Array<{ key: string; from: string; to: string; data: E }>
  ): DirectedGraph<V, E> {
    const instance = new DirectedGraph<V, E>();

    vertices.forEach(({ key, data }) => instance.insertVertex(key, data));
    edges?.forEach(({ key, from, to, data }) =>
      instance.insertEdge(from, to, key, data)
    );

    return instance;
  }

  isDirected(): this is DirectedGraph<V, E> {
    return true;
  }

  insertVertex(key: string, value: V): DirectedGraphVertex<V, E> {
    return this.insertVertexObject(new DirectedGraphVertex<V, E>(key, value));
  }

  insertEdge(
    sourceKey: string,
    targetKey: string,
    edgeKey: string,
    value: E
  ): DirectedEdge<E, V> {
    const source = this.vertex(sourceKey);
    const target = this.vertex(targetKey);

    if (!source) {
      throw new Error(`Vertex ${sourceKey} does not exist`);
    }
    if (!target) {
      throw new Error(`Vertex ${targetKey} does not exist`);
    }

    const edge = new DirectedEdge<E, V>(edgeKey, value, source, target);
    this.insertEdgeObject(edge);

    source.addOutEdge(edge);
    target.addInEdge(edge);

    return edge;
  }

  removeEdge(key: string): E {
    const edge = this.edge(key);

    if (!edge) {
      throw new Error(`Edge ${key} does not exist`);
    }

    edge.source.removeOutEdge(key);
    edge.target.removeInEdge(key);
    delete this.edges$[key];
    this.notifyEdgeRemoved(edge);

    return edge.value;
  }
}

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

  override isDirected(): this is DirectedGraph<V, E> {
    return true;
  }

  override insertVertex(key: string, value: V): DirectedGraphVertex<V, E> {
    return this.insertVertexObject(new DirectedGraphVertex<V, E>(key, value));
  }

  override insertEdge(
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
    source.addOutEdge(edge);
    target.addInEdge(edge);

    this.insertEdgeObject(edge);

    return edge;
  }

  override removeEdge(key: string): E {
    const edge = this.edge(key);

    if (!edge) {
      throw new Error(`Edge ${key} does not exist`);
    }

    edge.source.removeOutEdge(key);
    edge.target.removeInEdge(key);
    this.removeEdgeObject(edge);

    return edge.value;
  }

  override orderEdgesBetweenVertices(
    edges: Array<DirectedEdge<E, V>>
  ): Array<{ edge: DirectedEdge<E, V>; order: number }> {
    // Display edges that have the same direction next to each other
    let order = 0;
    let oppositeOrder = 0; // For edges in the opposite direction

    return edges.map(edge => {
      if (edge.source.key < edge.target.key) {
        return { edge, order: order++ };
      }
      return { edge, order: oppositeOrder++ };
    });
  }
}

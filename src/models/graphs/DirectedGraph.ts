import DirectedEdge from '@/models/edges/DirectedEdge';
import DirectedGraphVertex from '@/models/vertices/DirectedGraphVertex';
import { DirectedEdgeData, VertexData } from '@/types/data';

import Graph from './Graph';

export default class DirectedGraph<V, E> extends Graph<
  V,
  E,
  DirectedGraphVertex<V, E>,
  DirectedEdge<E, V>,
  DirectedEdgeData<E>
> {
  constructor(data: {
    vertices: Array<VertexData<V>>;
    edges?: Array<DirectedEdgeData<E>>;
  }) {
    super();
    this.insertBatch(data);
  }

  override isDirected(): this is DirectedGraph<V, E> {
    return true;
  }

  override insertVertex(
    key: string,
    value: V,
    notifyObservers?: boolean
  ): DirectedGraphVertex<V, E> {
    return this.insertVertexObject(
      new DirectedGraphVertex<V, E>(key, value),
      notifyObservers
    );
  }

  override insertEdge(
    key: string,
    value: E,
    sourceKey: string,
    targetKey: string,
    notifyObservers?: boolean
  ): DirectedEdge<E, V> {
    this.checkSelfLoop(sourceKey, targetKey);
    const source = this.getVertex(sourceKey);
    const target = this.getVertex(targetKey);

    if (!source) {
      throw new Error(`Vertex ${sourceKey} does not exist`);
    }
    if (!target) {
      throw new Error(`Vertex ${targetKey} does not exist`);
    }

    const edge = new DirectedEdge<E, V>(key, value, source, target);
    source.addOutEdge(edge);
    target.addInEdge(edge);
    this.insertEdgeObject(edge, notifyObservers);

    return edge;
  }

  override removeEdge(key: string, notifyObservers?: boolean): E {
    const edge = this.getEdge(key);

    if (!edge) {
      throw new Error(`Edge ${key} does not exist`);
    }

    edge.source.removeOutEdge(key);
    edge.target.removeInEdge(key);
    this.removeEdgeObject(edge, notifyObservers);

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

  override insertBatch(
    {
      vertices,
      edges
    }: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<DirectedEdgeData<E>>;
    },
    notifyObservers = true
  ): void {
    // Insert edges and vertices to the graph model
    vertices?.forEach(({ key, data }) => this.insertVertex(key, data, false));
    edges?.forEach(({ key, data, from, to }) =>
      this.insertEdge(key, data, from, to, false)
    );
    // Notify observers after all changes to the graph model are made
    if (notifyObservers) {
      this.notifyChange();
    }
  }

  override replaceBatch(
    batchData: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<DirectedEdgeData<E>>;
    },
    notifyObservers = true
  ): void {
    this.clear();
    setTimeout(() => {
      this.insertBatch(batchData, notifyObservers);
    }, 0);
  }
}

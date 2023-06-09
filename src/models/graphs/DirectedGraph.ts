import DirectedEdge from '@/models/edges/DirectedEdge';
import DirectedGraphVertex from '@/models/vertices/DirectedGraphVertex';
import {
  AnimationSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/animations';
import { DirectedEdgeData, VertexData } from '@/types/data';
import {
  createAnimationsSettingsForBatchModification,
  createAnimationsSettingsForSingleModification
} from '@/utils/animations';

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
    { key, value }: VertexData<V>,
    animationSettings?: SingleModificationAnimationSettings | null
  ): DirectedGraphVertex<V, E> {
    return this.insertVertexObject(
      new DirectedGraphVertex<V, E>(key, value),
      animationSettings &&
        createAnimationsSettingsForSingleModification(
          { vertex: key },
          animationSettings
        )
    );
  }

  override insertEdge(
    { key, value, from: sourceKey, to: targetKey }: DirectedEdgeData<E>,
    animationSettings?: SingleModificationAnimationSettings | null
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
    this.insertEdgeObject(
      edge,
      animationSettings &&
        createAnimationsSettingsForSingleModification(
          { edge: key },
          animationSettings
        )
    );

    return edge;
  }

  override removeEdge(
    key: string,
    animationSettings?: SingleModificationAnimationSettings | null
  ): E {
    const edge = this.getEdge(key);

    if (!edge) {
      throw new Error(`Edge ${key} does not exist`);
    }

    edge.source.removeOutEdge(key);
    edge.target.removeInEdge(key);
    this.removeEdgeObject(
      edge,
      animationSettings &&
        createAnimationsSettingsForSingleModification(
          { edge: key },
          animationSettings
        )
    );

    return edge.value;
  }

  override insertBatch(
    {
      vertices,
      edges
    }: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<DirectedEdgeData<E>>;
    },
    animationSettings?: BatchModificationAnimationSettings | null
  ): void {
    // Insert edges and vertices to the graph model
    vertices?.forEach(data => this.insertVertex(data, null));
    edges?.forEach(data => this.insertEdge(data, null));
    // Notify observers after all changes to the graph model are made
    if (animationSettings) {
      this.notifyChange(
        createAnimationsSettingsForBatchModification({
          vertices: vertices?.map(({ key }) => key),
          edges: edges?.map(({ key }) => key)
        })
      );
    }
  }

  override replaceBatch(
    batchData: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<DirectedEdgeData<E>>;
    },
    animationSettings?: AnimationSettings | null
  ): void {
    this.clear();
    setTimeout(() => {
      this.insertBatch(batchData, animationSettings);
    }, 0);
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

import DirectedEdge from '@/models/edges/DirectedEdge';
import DirectedGraphVertex from '@/models/vertices/DirectedGraphVertex';
import { DirectedEdgeData, VertexData } from '@/types/data';
import { GraphConnections } from '@/types/graphs';
import {
  AnimationSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings';
import { Maybe } from '@/types/utils';
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
  constructor(data?: {
    edges?: Array<DirectedEdgeData<E>>;
    vertices: Array<VertexData<V>>;
  }) {
    super();
    if (data) this.insertBatch(data);
  }

  get connections(): GraphConnections {
    return Object.fromEntries(
      Object.values(this.vertices$).map(vertex => [
        vertex.key,
        {
          incoming: vertex.inEdges.map(edge => edge.source.key),
          outgoing: vertex.outEdges.map(edge => edge.target.key)
        }
      ])
    );
  }

  override insertBatch(
    {
      edges,
      vertices
    }: {
      edges?: Array<DirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>
  ): void {
    // Insert edges and vertices to the graph model
    vertices?.forEach(data => this.insertVertex(data, null));
    edges?.forEach(data => this.insertEdge(data, null));
    // Notify observers after all changes to the graph model are made
    if (animationSettings !== null) {
      this.notifyGraphChange(
        createAnimationsSettingsForBatchModification(
          {
            edges: edges?.map(({ key }) => key),
            vertices: vertices?.map(({ key }) => key)
          },
          animationSettings
        )
      );
    }
  }

  override insertEdge(
    { from: sourceKey, key, to: targetKey, value }: DirectedEdgeData<E>,
    animationSettings?: Maybe<SingleModificationAnimationSettings>
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

  override insertVertex(
    { key, value }: VertexData<V>,
    animationSettings?: Maybe<SingleModificationAnimationSettings>
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

  override isDirected(): this is DirectedGraph<V, E> {
    return true;
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

  override removeEdge(
    key: string,
    animationSettings?: Maybe<SingleModificationAnimationSettings>
  ): E | undefined {
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

  override replaceBatch(
    batchData: {
      edges?: Array<DirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<AnimationSettings>
  ): void {
    this.clear();
    setTimeout(() => {
      this.insertBatch(batchData, animationSettings);
    }, 0);
  }
}

import DirectedEdge from '@/models/edges/DirectedEdge';
import DirectedGraphVertex from '@/models/vertices/DirectedGraphVertex';
import { Maybe } from '@/types/utils';
import { DirectedEdgeData, VertexData } from '@/types/data';
import { GraphConnections } from '@/types/graphs';
import {
  AnimationSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings';
import {
  createAnimationsSettingsForBatchModification,
  createAnimationsSettingsForSingleModification
} from '@/utils/animations';

import Graph from './Graph';

export default class DirectedGraph<V = void, E = void> extends Graph<
  V,
  E,
  DirectedGraphVertex<V, E>,
  DirectedEdge<V, E>,
  DirectedEdgeData<E>
> {
  constructor(data?: {
    edges?: Array<DirectedEdgeData<E>>;
    vertices: Array<VertexData<V>>;
  }) {
    super();
    if (data) this.insertBatch(data);
  }

  override get connections(): GraphConnections {
    if (!this.cachedConnections) {
      this.cachedConnections = Object.fromEntries(
        Object.values(this.vertices$).map(vertex => [
          vertex.key,
          {
            incoming: vertex.inEdges.map(edge => edge.source.key),
            outgoing: vertex.outEdges.map(edge => edge.target.key)
          }
        ])
      );
    }
    return this.cachedConnections;
  }

  override insertBatch(
    {
      edges,
      vertices
    }: {
      edges?: Array<DirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>,
    notifyChange = true
  ): void {
    // Insert edges and vertices to the graph model
    vertices?.forEach(data => this.insertVertex(data, null, false));
    edges?.forEach(data => this.insertEdge(data, null, false));
    // Notify observers after all changes to the graph model are made
    if (notifyChange) {
      this.notifyGraphChange(
        animationSettings &&
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
    animationSettings?: Maybe<SingleModificationAnimationSettings>,
    notifyChange = true
  ): DirectedEdge<V, E> {
    this.checkSelfLoop(sourceKey, targetKey);
    const source = this.getVertex(sourceKey);
    const target = this.getVertex(targetKey);

    if (!source) {
      throw new Error(`Vertex ${sourceKey} does not exist`);
    }
    if (!target) {
      throw new Error(`Vertex ${targetKey} does not exist`);
    }

    const edge = new DirectedEdge<V, E>(key, value, source, target);
    source.addOutEdge(edge);
    target.addInEdge(edge);
    this.insertEdgeObject(
      edge,
      animationSettings &&
        createAnimationsSettingsForSingleModification(
          { edge: key },
          animationSettings
        ),
      notifyChange
    );

    return edge;
  }

  override insertVertex(
    { key, value }: VertexData<V>,
    animationSettings?: Maybe<SingleModificationAnimationSettings>,
    notifyChange = true
  ): DirectedGraphVertex<V, E> {
    return this.insertVertexObject(
      new DirectedGraphVertex<V, E>(key, value),
      animationSettings &&
        createAnimationsSettingsForSingleModification(
          { vertex: key },
          animationSettings
        ),
      notifyChange
    );
  }

  override isDirected(): this is DirectedGraph<V, E> {
    return true;
  }

  override orderEdgesBetweenVertices(
    edges: Array<DirectedEdge<V, E>>
  ): Array<{ edge: DirectedEdge<V, E>; order: number }> {
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
    animationSettings?: Maybe<AnimationSettings>,
    notifyChange = true
  ): void {
    this.clear(null, false);
    setTimeout(() => {
      this.insertBatch(batchData, animationSettings, notifyChange);
    }, 0);
  }
}

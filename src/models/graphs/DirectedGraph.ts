import { DirectedEdge } from '@/models/edges';
import { DirectedGraphVertex } from '@/models/vertices';
import { DirectedEdgeData, DirectedGraphData, VertexData } from '@/types/data';
import {
  DirectedEdge as IDirectedEdge,
  DirectedGraphVertex as IDirectedGraphVertex,
  GraphConnections
} from '@/types/models';
import {
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings';
import {
  createAnimationsSettingsForBatchModification,
  createAnimationsSettingsForSingleModification
} from '@/utils/animations';
import { catchError, getDirectedEdgeData } from '@/utils/models';

import Graph from './Graph';

export default class DirectedGraph<V = unknown, E = unknown> extends Graph<
  V,
  E,
  IDirectedGraphVertex<V, E>,
  IDirectedEdge<V, E>,
  DirectedEdgeData<E>
> {
  protected cachedData: DirectedGraphData<V, E> | null = null;

  override insertBatch = catchError(
    (
      {
        edges,
        vertices
      }: {
        edges?: Array<DirectedEdgeData<E>>;
        vertices?: Array<VertexData<V>>;
      },
      animationSettings?: BatchModificationAnimationSettings,
      notifyChange = true
    ): void => {
      // Insert edges and vertices to the graph model
      for (const vertexData of vertices ?? []) {
        this.insertVertex(vertexData, null, false);
      }
      for (const edgeData of edges ?? []) {
        this.insertEdge(edgeData, null, false);
      }
      // Notify observers after all changes to the graph model are made
      if (notifyChange) {
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
  );

  override insertEdge = catchError(
    (
      { from: sourceKey, key, to: targetKey, value }: DirectedEdgeData<E>,
      animationSettings?: SingleModificationAnimationSettings,
      notifyChange: boolean = true // this somehow fixes type error in insertEdgeObject
    ): void => {
      this.checkSelfLoop(sourceKey, targetKey);
      const source = this.getVertex(sourceKey);
      const target = this.getVertex(targetKey);

      if (!source) {
        throw new Error(`Vertex ${sourceKey} does not exist`);
      }
      if (!target) {
        throw new Error(`Vertex ${targetKey} does not exist`);
      }

      const edge = new DirectedEdge<V, E>(key, value as E, source, target);
      source.addOutEdge(edge);
      target.addInEdge(edge);
      this.insertEdgeObject(
        edge,
        createAnimationsSettingsForSingleModification(
          { edge: key },
          animationSettings
        ),
        notifyChange
      );
    }
  );

  override insertVertex = catchError(
    (
      { key, value }: VertexData<V>,
      animationSettings?: SingleModificationAnimationSettings,
      notifyChange: boolean = true // this somehow fixes type error in insertVertexObject
    ): void => {
      return this.insertVertexObject(
        new DirectedGraphVertex<V, E>(key, value as V),
        createAnimationsSettingsForSingleModification(
          { vertex: key },
          animationSettings
        ),
        notifyChange
      );
    }
  );

  override removeEdge = catchError(
    (
      key: string,
      animationSettings?: SingleModificationAnimationSettings,
      notifyChange: boolean = true
    ): void => {
      const edge = this.getEdge(key);

      if (!edge) {
        throw new Error(`Edge ${key} does not exist`);
      }

      edge.source.removeOutEdge(key);
      edge.target.removeInEdge(key);
      this.removeEdgeObject(
        edge,
        createAnimationsSettingsForSingleModification(
          { edge: key },
          animationSettings
        ),
        notifyChange
      );
    }
  );

  override replaceBatch = catchError(
    (
      batchData: {
        edges?: Array<DirectedEdgeData<E>>;
        vertices?: Array<VertexData<V>>;
      },
      animationSettings?: BatchModificationAnimationSettings,
      notifyChange = true
    ): void => {
      this.clear(null, false);
      setTimeout(() => {
        this.insertBatch(batchData, animationSettings, notifyChange);
      }, 0);
    }
  );

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

  override get edgesData(): Array<DirectedEdgeData<E>> {
    if (!this.cachedEdgesData) {
      this.cachedEdgesData = this.edges.map(getDirectedEdgeData);
    }
    return this.cachedEdgesData;
  }

  override get graphData(): DirectedGraphData<V, E> {
    if (!this.cachedData) {
      this.cachedData = {
        edges: this.edgesData,
        vertices: this.verticesData
      };
    }
    return this.cachedData;
  }

  override invalidateDataCache(): void {
    this.cachedData = null;
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
}

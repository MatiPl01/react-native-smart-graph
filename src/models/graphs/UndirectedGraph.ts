import { UndirectedEdge } from '@/models/edges';
import { UndirectedGraphVertex } from '@/models/vertices';
import {
  UndirectedEdgeData,
  UndirectedGraphData,
  VertexData
} from '@/types/data';
import {
  GraphConnections,
  UndirectedEdge as IUndirectedEdge,
  UndirectedGraphVertex as IUndirectedGraphVertex
} from '@/types/models';
import {
  AnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings';
import { Maybe } from '@/types/utils';
import {
  createAnimationsSettingsForBatchModification,
  createAnimationsSettingsForSingleModification
} from '@/utils/animations';
import { catchError, getUndirectedEdgeData } from '@/utils/models';

import Graph from './Graph';

export default class UndirectedGraph<V = unknown, E = unknown> extends Graph<
  V,
  E,
  IUndirectedGraphVertex<V, E>,
  IUndirectedEdge<V, E>,
  UndirectedEdgeData<E>
> {
  protected cachedData: UndirectedGraphData<V, E> | null = null;

  override insertBatch = catchError(
    (
      {
        edges,
        vertices
      }: {
        edges?: Array<UndirectedEdgeData<E>>;
        vertices?: Array<VertexData<V>>;
      },
      animationSettings?: Maybe<AnimationSettings>,
      notifyChange = true
    ): void => {
      // Insert edges and vertices to the graph model
      for (const vertex of vertices ?? []) {
        this.insertVertex(vertex, null, false);
      }
      for (const edge of edges ?? []) {
        this.insertEdge(edge, null, false);
      }
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
  );

  override insertEdge = catchError(
    (
      { key, value, vertices: [vertex1key, vertex2key] }: UndirectedEdgeData<E>,
      animationSettings?: Maybe<AnimationSettings>,
      notifyChange: boolean = true // this somehow fixes the type error in insertEdgeObject
    ): void => {
      if (!vertex1key || !vertex2key) {
        throw new Error(`Edge ${key} must have two vertices`);
      }

      this.checkSelfLoop(vertex1key, vertex2key);
      const vertex1 = this.getVertex(vertex1key);
      const vertex2 = this.getVertex(vertex2key);

      if (!vertex1) {
        throw new Error(`Vertex ${vertex1key} does not exist`);
      }
      if (!vertex2) {
        throw new Error(`Vertex ${vertex2key} does not exist`);
      }

      const edge = new UndirectedEdge<V, E>(key, value as E, [
        vertex1,
        vertex2
      ]);

      vertex1.addEdge(edge);
      if (vertex1key !== vertex2key) {
        vertex2.addEdge(edge);
      }
      this.insertEdgeObject(
        edge,
        animationSettings &&
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
      animationSettings?: Maybe<SingleModificationAnimationSettings>,
      notifyChange: boolean = true // this somehow fixes the type error in insertVertexObject
    ): void => {
      return this.insertVertexObject(
        new UndirectedGraphVertex<V, E>(key, value as V),
        animationSettings &&
          createAnimationsSettingsForSingleModification(
            { vertex: key },
            animationSettings
          ),
        notifyChange
      );
    }
  );

  override removeEdge = catchError(
    (key: string, animationSettings?: Maybe<AnimationSettings>): void => {
      const edge = this.getEdge(key);

      if (!edge) {
        throw new Error(`Edge ${key} does not exist`);
      }

      edge.vertices[0].removeEdge(key);
      if (!edge.isLoop) {
        edge.vertices[1].removeEdge(key);
      }
      this.removeEdgeObject(
        edge,
        animationSettings &&
          createAnimationsSettingsForSingleModification(
            { edge: key },
            animationSettings
          )
      );
    }
  );

  override replaceBatch = catchError(
    (
      batchData: {
        edges?: Array<UndirectedEdgeData<E>>;
        vertices?: Array<VertexData<V>>;
      },
      animationSettings?: Maybe<AnimationSettings>,
      notifyChange = true
    ): void => {
      this.clear(null, false);
      setTimeout(() => {
        this.insertBatch(batchData, animationSettings, notifyChange);
      }, 0);
    }
  );

  constructor(data?: {
    edges?: Array<UndirectedEdgeData<E>>;
    vertices: Array<VertexData<V>>;
  }) {
    super();
    if (data) this.insertBatch(data);
  }

  override get connections(): GraphConnections {
    if (!this.cachedConnections) {
      this.cachedConnections = Object.fromEntries(
        Object.values(this.vertices$).map(vertex => {
          const neighbors = vertex.edges.map(edge =>
            edge.vertices[0].key === vertex.key
              ? edge.vertices[1].key
              : edge.vertices[0].key
          );

          return [
            vertex.key,
            {
              incoming: [],
              outgoing: neighbors
            }
          ];
        })
      );
    }
    return this.cachedConnections;
  }

  override get edgesData(): Array<UndirectedEdgeData<E>> {
    if (!this.cachedEdgesData) {
      this.cachedEdgesData = this.edges.map(getUndirectedEdgeData);
    }
    return this.cachedEdgesData;
  }

  override get graphData(): UndirectedGraphData<V, E> {
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

  override isDirected() {
    return false;
  }

  override orderEdgesBetweenVertices(
    edges: Array<UndirectedEdge<V, E>>
  ): Array<{ edge: UndirectedEdge<V, E>; order: number }> {
    return edges.map((edge, index) => ({
      edge,
      order: index
    }));
  }
}

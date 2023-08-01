import UndirectedEdge from '@/models/edges/UndirectedEdge';
import UndirectedGraphVertex from '@/models/vertices/UndirectedGraphVertex';
import { UndirectedEdgeData, VertexData } from '@/types/data';
import { GraphConnections } from '@/types/graphs';
import {
  AnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings';
import { Maybe } from '@/types/utils';
import {
  createAnimationsSettingsForBatchModification,
  createAnimationsSettingsForSingleModification
} from '@/utils/animations';

import Graph from './Graph';

export default class UndirectedGraph<V = void, E = void> extends Graph<
  V,
  E,
  UndirectedGraphVertex<V, E>,
  UndirectedEdge<E, V>,
  UndirectedEdgeData<E>
> {
  constructor(data?: {
    edges?: Array<UndirectedEdgeData<E>>;
    vertices: Array<VertexData<V>>;
  }) {
    super();
    if (data) this.insertBatch(data);
  }

  override get connections(): GraphConnections {
    return Object.fromEntries(
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

  override insertBatch(
    {
      edges,
      vertices
    }: {
      edges?: Array<UndirectedEdgeData<E>>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<AnimationSettings>,
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
    { key, value, vertices: [vertex1key, vertex2key] }: UndirectedEdgeData<E>,
    animationSettings?: Maybe<AnimationSettings>,
    notifyChange = true
  ): UndirectedEdge<E, V> {
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

    const edge = new UndirectedEdge<E, V>(key, value, [vertex1, vertex2]);

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

    return edge;
  }

  override insertVertex(
    { key, value }: VertexData<V>,
    animationSettings?: Maybe<SingleModificationAnimationSettings>,
    notifyChange = true
  ): UndirectedGraphVertex<V, E> {
    return this.insertVertexObject(
      new UndirectedGraphVertex<V, E>(key, value),
      animationSettings &&
        createAnimationsSettingsForSingleModification(
          { vertex: key },
          animationSettings
        ),
      notifyChange
    );
  }

  override isDirected() {
    return false;
  }

  override orderEdgesBetweenVertices(
    edges: Array<UndirectedEdge<E, V>>
  ): Array<{ edge: UndirectedEdge<E, V>; order: number }> {
    return edges.map((edge, index) => ({
      edge,
      order: index
    }));
  }

  override removeEdge(
    key: string,
    animationSettings?: Maybe<AnimationSettings>
  ): E | undefined {
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

    return edge.value;
  }

  override replaceBatch(
    batchData: {
      edges?: Array<UndirectedEdgeData<E>>;
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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DirectedEdgeData, UndirectedEdgeData, VertexData } from '@/types/data';
import {
  Edge,
  Graph as IGraph,
  GraphConnections,
  GraphObserver,
  Vertex
} from '@/types/graphs';
import {
  AnimationSettings,
  AnimationsSettings,
  BatchModificationAnimationSettings
} from '@/types/settings';
import { FocusSettings } from '@/types/settings/focus';
import { Maybe, Mutable } from '@/types/utils';
import { createAnimationsSettingsForBatchModification } from '@/utils/animations';

export default abstract class Graph<
  V,
  E,
  GV extends Vertex<V, E>,
  GE extends Edge<E, V>,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> implements IGraph<V, E>
{
  private focusedVertexKey: null | string = null;
  private readonly observers: Set<GraphObserver> = new Set();
  protected readonly edges$: Record<string, GE> = {};
  protected readonly edgesBetweenVertices$: Record<
    string,
    Record<string, Array<GE>>
  > = {};

  protected readonly vertices$: Record<string, GV> = {};

  addObserver(observer: GraphObserver): void {
    this.observers.add(observer);
  }

  blur(settings?: Maybe<AnimationSettings>): void {
    if (!this.focusedVertexKey) return;
    this.focusedVertexKey = null;
    this.notifyFocusChange(null, {
      animation: settings
    });
  }

  // TODO - remove this method after adding self-loop edges support
  protected checkSelfLoop(vertex1key: string, vertex2key: string): void {
    if (vertex1key === vertex2key) {
      throw new Error(
        `Self-loop edges are not yet supported. Vertex key: ${vertex1key}`
      );
    }
  }

  clear(animationSettings?: Maybe<BatchModificationAnimationSettings>): void {
    // Clear the whole graph
    (this.vertices$ as Mutable<typeof this.vertices$>) = {};
    (this.edges$ as Mutable<typeof this.edges$>) = {};
    (this.edgesBetweenVertices$ as Mutable<typeof this.edgesBetweenVertices$>) =
      {};
    // Notify observers after all changes to the graph model are made
    this.notifyGraphChange(
      animationSettings &&
        createAnimationsSettingsForBatchModification(
          {
            edges: Object.keys(this.edges$),
            vertices: Object.keys(this.vertices$)
          },
          animationSettings
        )
    );
  }

  get connections(): GraphConnections {
    return Object.fromEntries(
      Object.values(this.vertices$).map(vertex => [
        vertex.key,
        vertex.edges.map(edge =>
          edge.vertices[0].key === vertex.key
            ? edge.vertices[1].key
            : edge.vertices[0].key
        )
      ])
    );
  }

  get edges(): Array<GE> {
    return Object.values(this.edges$);
  }

  focus(vertexKey: string, settings?: FocusSettings): void {
    if (!this.vertices$[vertexKey]) {
      throw new Error(`Vertex with key ${vertexKey} does not exist.`);
    }
    this.focusedVertexKey = vertexKey;
    this.notifyFocusChange(vertexKey, settings);
  }

  getEdge(key: string): GE | null {
    return this.edges$[key] ?? null;
  }

  getEdgesBetween(vertex1key: string, vertex2key: string): Array<GE> {
    const res = this.edgesBetweenVertices$[vertex1key]?.[vertex2key];
    return res ? [...res] : []; // Create a copy of the array
  }

  getVertex(key: string): GV | null {
    return this.vertices$[key] ?? null;
  }

  hasEdge(key: string): boolean {
    return !!this.edges$[key];
  }

  hasVertex(key: string): boolean {
    return !!this.vertices$[key];
  }

  protected insertEdgeObject(
    edge: GE,
    animationsSettings?: Maybe<AnimationsSettings>
  ): GE {
    if (this.edges$[edge.key]) {
      throw new Error(`Edge with key ${edge.key} already exists.`);
    }
    // Add edge to edges between vertices
    const [vertex1, vertex2] = edge.vertices;
    if (!this.edgesBetweenVertices$[vertex1.key]) {
      this.edgesBetweenVertices$[vertex1.key] = {};
    }
    if (!this.edgesBetweenVertices$[vertex2.key]) {
      this.edgesBetweenVertices$[vertex2.key] = {};
    }
    if (!this.edgesBetweenVertices$[vertex1.key]![vertex2.key]) {
      this.edgesBetweenVertices$[vertex1.key]![vertex2.key] = [];
    }
    if (!this.edgesBetweenVertices$[vertex2.key]![vertex1.key]) {
      this.edgesBetweenVertices$[vertex2.key]![vertex1.key] =
        this.edgesBetweenVertices$[vertex1.key]![vertex2.key]!;
    }
    this.edgesBetweenVertices$[vertex1.key]![vertex2.key]!.push(edge);
    // Add edge to edges
    this.edges$[edge.key] = edge;
    this.notifyGraphChange(animationsSettings);
    return edge;
  }

  protected insertVertexObject(
    vertex: GV,
    animationSettings?: Maybe<AnimationsSettings>
  ): GV {
    if (this.vertices$[vertex.key]) {
      throw new Error(`Vertex with key ${vertex.key} already exists.`);
    }
    this.vertices$[vertex.key] = vertex;
    this.notifyGraphChange(animationSettings);
    return vertex;
  }

  protected notifyFocusChange(
    vertexKey: null | string,
    settings?: FocusSettings
  ): void {
    this.observers.forEach(observer => {
      observer.focusChanged?.(vertexKey, settings);
    });
  }

  protected notifyGraphChange(
    animationsSettings?: Maybe<AnimationsSettings>
  ): void {
    this.observers.forEach(observer => {
      observer.graphChanged?.(
        animationsSettings ?? {
          edges: {},
          vertices: {}
        }
      );
    });
  }

  get orderedEdges(): Array<{ edge: GE; edgesCount: number; order: number }> {
    const addedEdgesKeys = new Set<string>();
    const result: Array<{ edge: GE; edgesCount: number; order: number }> = [];

    this.edges.forEach(edge => {
      if (addedEdgesKeys.has(edge.key)) {
        return;
      }
      const [v1, v2] = edge.vertices;
      const edgesBetweenVertices =
        this.edgesBetweenVertices$[v1.key]?.[v2.key] ?? [];
      this.orderEdgesBetweenVertices(edgesBetweenVertices).forEach(
        ({ edge: e, order }) => {
          result.push({
            edge: e,
            edgesCount: edgesBetweenVertices.length,
            order
          });
          addedEdgesKeys.add(edge.key);
        }
      );
    });

    return result;
  }

  removeBatch(
    data: {
      edges?: Array<string>;
      vertices?: Array<string>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>
  ): void {
    // Remove edges and vertices from graph
    data.edges?.forEach(key => this.removeEdge(key, null));
    data.vertices?.forEach(key => this.removeVertex(key, null));
    // Notify observers after all changes to the graph model are made
    this.notifyGraphChange(
      animationSettings &&
        createAnimationsSettingsForBatchModification(
          {
            edges: data.edges,
            vertices: data.vertices
          },
          animationSettings
        )
    );
  }

  protected removeEdgeObject(
    edge: GE,
    animationsSettings?: Maybe<AnimationsSettings>
  ): void {
    // Remove edge from edges between vertices
    const [vertex1, vertex2] = edge.vertices;
    this.edgesBetweenVertices$[vertex1.key]![vertex2.key]?.splice(
      this.edgesBetweenVertices$[vertex1.key]![vertex2.key]!.indexOf(edge),
      1
    );
    if (!this.edgesBetweenVertices$[vertex1.key]![vertex2.key]!.length) {
      delete this.edgesBetweenVertices$[vertex1.key]![vertex2.key];
      delete this.edgesBetweenVertices$[vertex2.key]![vertex1.key];
    }
    if (!Object.keys(this.edgesBetweenVertices$[vertex1.key]!).length) {
      delete this.edgesBetweenVertices$[vertex1.key];
    }
    if (!Object.keys(this.edgesBetweenVertices$[vertex2.key]!).length) {
      delete this.edgesBetweenVertices$[vertex2.key];
    }
    // Remove the edge from edges
    delete this.edges$[edge.key];
    this.notifyGraphChange(animationsSettings);
  }

  removeObserver(observer: GraphObserver): void {
    this.observers.delete(observer);
  }

  removeVertex(
    key: string,
    animationsSettings?: Maybe<AnimationsSettings>
  ): V | undefined {
    if (!this.vertices$[key]) {
      throw new Error(`Vertex with key ${key} does not exist.`);
    }

    // Blur vertex if it is focused
    if (this.focusedVertexKey === key) {
      this.blur();
    }

    const vertex = this.vertices$[key] as GV;
    vertex.edges.forEach(edge => {
      this.removeEdge(edge.key);
    });
    delete this.vertices$[key];
    this.notifyGraphChange(animationsSettings);

    return vertex.value;
  }

  get vertices(): Array<GV> {
    return Object.values(this.vertices$);
  }

  abstract insertBatch(
    data: {
      edges?: Array<ED>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>
  ): void;

  abstract insertEdge(
    data: ED,
    animationSettings?: Maybe<AnimationSettings>
  ): GE;

  abstract insertVertex(
    data: VertexData<V>,
    animationSettings?: Maybe<AnimationSettings>
  ): GV;

  abstract isDirected(): boolean;

  abstract orderEdgesBetweenVertices(
    edges: Array<GE>
  ): Array<{ edge: GE; order: number }>;

  abstract removeEdge(
    key: string,
    animationSettings?: Maybe<AnimationSettings>
  ): E | undefined;

  abstract replaceBatch(
    data: {
      edges?: Array<ED>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: Maybe<BatchModificationAnimationSettings>
  ): void;
}

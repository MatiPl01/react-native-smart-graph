/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DirectedEdgeData,
  DirectedGraphData,
  UndirectedEdgeData,
  UndirectedGraphData,
  VertexData
} from '@/types/data';
import {
  DirectedEdge,
  Graph as IGraph,
  GraphConnections,
  GraphObserver,
  OrderedEdges,
  UndirectedEdge,
  Vertex
} from '@/types/models';
import {
  AnimationSettings,
  BatchModificationAnimationSettings,
  FocusSettings,
  GraphModificationAnimationsSettings,
  SingleModificationAnimationSettings
} from '@/types/settings';
import { Maybe, Mutable } from '@/types/utils';
import { createAnimationsSettingsForBatchModification } from '@/utils/animations';
import { catchError, ChangeResult, getVertexData } from '@/utils/models';

export default abstract class Graph<
  V,
  E,
  GV extends Vertex<V, E>,
  GE extends DirectedEdge<V, E> | UndirectedEdge<V, E>,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> implements IGraph<V, E>
{
  private focusedVertexKey: null | string = null;
  private lastFocusChangeSettings: FocusSettings | null = null;
  private lastGraphChangeSettings: GraphModificationAnimationsSettings | null =
    null;
  private readonly observers = new Set<GraphObserver>();

  protected cachedConnections: GraphConnections | null = null;
  protected cachedEdges: Array<GE> | null = null;
  protected cachedEdgesData: Array<ED> | null = null;
  protected cachedOrderedEdges: Array<{
    edge: GE;
    edgesCount: number;
    order: number;
  }> | null = null;
  protected cachedVertices: Array<GV> | null = null;
  protected cachedVerticesData: Array<VertexData<V>> | null = null;

  clear = catchError(
    (
      animationSettings?: BatchModificationAnimationSettings,
      notifyChange = true
    ): void => {
      // Clear the whole graph
      (this.vertices$ as Mutable<typeof this.vertices$>) = {};
      (this.edges$ as Mutable<typeof this.edges$>) = {};
      (this.edgesBetweenVertices$ as Mutable<
        typeof this.edgesBetweenVertices$
      >) = {};
      // Invalidate cached data
      this.invalidateEdgesCache();
      this.invalidateVerticesCache();
      // Notify observers after all changes to the graph model are made
      if (notifyChange) {
        this.notifyGraphChange(
          createAnimationsSettingsForBatchModification(
            {
              edges: Object.keys(this.edges$),
              vertices: Object.keys(this.vertices$)
            },
            animationSettings
          )
        );
      }
    }
  );

  protected readonly edges$: Record<string, GE> = {};
  protected readonly edgesBetweenVertices$: Record<
    string,
    Record<string, Array<GE>>
  > = {};

  focus = catchError((vertexKey: string, settings?: FocusSettings): void => {
    if (!this.vertices$[vertexKey]) {
      throw new Error(`Vertex with key ${vertexKey} does not exist.`);
    }
    this.focusedVertexKey = vertexKey;
    this.notifyFocusChange(vertexKey, settings);
  });

  removeBatch = catchError(
    (
      data: {
        edges?: Array<string>;
        vertices?: Array<string>;
      },
      animationSettings?: BatchModificationAnimationSettings,
      notifyChange = true
    ): void => {
      // Remove edges and vertices from graph
      for (const edgeKey of data.edges ?? []) {
        this.removeEdge(edgeKey, null, false);
      }
      for (const vertexKey of data.vertices ?? []) {
        this.removeVertex(vertexKey, null, false);
      }
      // Notify observers after all changes to the graph model are made
      if (notifyChange) {
        this.notifyGraphChange(
          createAnimationsSettingsForBatchModification(
            {
              edges: data.edges,
              vertices: data.vertices
            },
            animationSettings
          )
        );
      }
    }
  );

  removeVertex = catchError(
    (
      key: string,
      animationSettings?: SingleModificationAnimationSettings,
      notifyChange = true
    ): void => {
      if (!this.vertices$[key]) {
        throw new Error(`Vertex with key ${key} does not exist.`);
      }

      // Blur vertex if it is focused
      if (this.focusedVertexKey === key) {
        this.blur();
      }

      const vertex = this.vertices$[key] as GV;
      const edgeKeys = vertex.edges.map(edge => edge.key);
      for (const edgeKey of edgeKeys) {
        this.removeEdge(edgeKey, null, false);
      }
      delete this.vertices$[key];
      this.invalidateVerticesCache();
      if (notifyChange) {
        this.notifyGraphChange(
          createAnimationsSettingsForBatchModification(
            { edges: edgeKeys, vertices: [key] },
            animationSettings
          )
        );
      }
    }
  );

  updateEdgeValue = catchError((key: string, value: E): void => {
    const targetEdge = this.edges$[key];
    if (!targetEdge) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    // There is no better way to implement this as exact types
    // aren't available yet
    // (https://github.com/Microsoft/TypeScript/issues/12936)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    targetEdge.value = value as any;
    this.cachedEdgesData = null;
    this.invalidateDataCache();
  });

  updateVertexValue = catchError((key: string, value: V): void => {
    const targetVertex = this.vertices$[key];
    if (!targetVertex) {
      throw new Error(`Vertex with key ${key} does not exist.`);
    }
    targetVertex.value = value;
    this.cachedVerticesData = null;
    this.invalidateDataCache();
  });

  protected readonly vertices$: Record<string, GV> = {};

  get edges(): Array<GE> {
    if (!this.cachedEdges) {
      this.cachedEdges = Object.values(this.edges$);
    }
    return this.cachedEdges;
  }

  get orderedEdges(): OrderedEdges<V, E, GE> {
    if (!this.cachedOrderedEdges) {
      const addedVerticesPairs: Record<string, Record<string, boolean>> = {};
      const result: OrderedEdges<V, E, GE> = [];

      // Loop over each vertices connected with edges
      for (const key1 in this.edgesBetweenVertices$) {
        for (const key2 in this.edgesBetweenVertices$[key1]) {
          // Skip if the pair of vertices was already added
          if (addedVerticesPairs[key1]?.[key2]) continue;
          // Mark the pair of vertices as added
          if (!addedVerticesPairs[key1]) {
            addedVerticesPairs[key1] = {};
          }
          if (!addedVerticesPairs[key2]) {
            addedVerticesPairs[key2] = {};
          }
          addedVerticesPairs[key1]![key2] = true;
          addedVerticesPairs[key2]![key1] = true;
          // Get edges between vertices
          const edges = this.edgesBetweenVertices$[key1]![key2]!;
          // Order edges between vertices
          const orderedEdges = this.orderEdgesBetweenVertices(edges);
          // Add ordered edges to result
          for (const { edge, order } of orderedEdges) {
            result.push({
              edge,
              edgesCount: edges.length,
              order
            });
          }
        }
      }

      this.cachedOrderedEdges = result;
    }

    return this.cachedOrderedEdges;
  }

  get vertices(): Array<GV> {
    if (!this.cachedVertices) {
      this.cachedVertices = Object.values(this.vertices$);
    }
    return this.cachedVertices;
  }

  get verticesData(): Array<VertexData<V>> {
    if (!this.cachedVerticesData) {
      this.cachedVerticesData = this.vertices.map(getVertexData);
    }
    return this.cachedVerticesData;
  }

  private invalidateEdgesCache(): void {
    // Invalidate cached edges data
    this.cachedEdges = null;
    this.cachedOrderedEdges = null;
    this.cachedConnections = null;
    this.cachedEdgesData = null;
    this.invalidateDataCache();
  }

  private invalidateVerticesCache(): void {
    // Invalidate cached vertices data
    this.cachedVertices = null;
    this.cachedConnections = null;
    this.cachedVerticesData = null;
    this.invalidateDataCache();
  }

  addObserver(observer: GraphObserver): void {
    this.observers.add(observer);
    // Notify about last changes
    if (this.lastGraphChangeSettings) {
      observer?.graphChanged?.(this.lastGraphChangeSettings);
    }
    if (this.focusedVertexKey) {
      observer?.focusChanged?.(
        this.focusedVertexKey,
        this.lastFocusChangeSettings ?? undefined
      );
    }
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
    animationsSettings?: GraphModificationAnimationsSettings,
    notifyChange = true
  ): void {
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
    this.invalidateEdgesCache();
    if (notifyChange) this.notifyGraphChange(animationsSettings);
  }

  protected insertVertexObject(
    vertex: GV,
    animationSettings?: GraphModificationAnimationsSettings,
    notifyChange = true
  ): void {
    if (this.vertices$[vertex.key]) {
      throw new Error(`Vertex with key ${vertex.key} already exists.`);
    }
    this.vertices$[vertex.key] = vertex;
    this.invalidateVerticesCache();
    if (notifyChange) this.notifyGraphChange(animationSettings);
  }

  protected notifyFocusChange(
    vertexKey: null | string,
    settings?: FocusSettings
  ): void {
    this.lastFocusChangeSettings = settings ?? null;
    for (const observer of this.observers) {
      observer.focusChanged?.(vertexKey, settings);
    }
  }

  protected notifyGraphChange(
    animationsSettings?: GraphModificationAnimationsSettings
  ): void {
    const updatedAnimationSettings = animationsSettings ?? {
      edges: {},
      vertices: {}
    };
    this.lastGraphChangeSettings = updatedAnimationSettings;
    for (const observer of this.observers) {
      observer.graphChanged?.(updatedAnimationSettings);
    }
  }

  protected removeEdgeObject(
    edge: GE,
    animationsSettings?: GraphModificationAnimationsSettings,
    notifyChange = true
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
    this.invalidateEdgesCache();
    if (notifyChange) this.notifyGraphChange(animationsSettings);
  }

  removeObserver(observer: GraphObserver): void {
    this.observers.delete(observer);
  }
  abstract get connections(): GraphConnections;

  abstract get edgesData(): Array<ED>;
  abstract get graphData(): DirectedGraphData<V, E> | UndirectedGraphData<V, E>;

  abstract insertBatch(
    data: {
      edges?: Array<ED>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: BatchModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;

  abstract insertEdge(
    data: ED,
    animationSettings?: SingleModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;

  abstract insertVertex(
    data: VertexData<V>,
    animationSettings?: SingleModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;

  protected abstract invalidateDataCache(): void;

  abstract isDirected(): boolean;

  protected abstract orderEdgesBetweenVertices(
    edges: Array<GE>
  ): Array<{ edge: GE; order: number }>;

  abstract removeEdge(
    key: string,
    animationSettings?: SingleModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;

  abstract replaceBatch(
    data: {
      edges?: Array<ED>;
      vertices?: Array<VertexData<V>>;
    },
    animationSettings?: BatchModificationAnimationSettings,
    notifyChange?: boolean
  ): ChangeResult;
}

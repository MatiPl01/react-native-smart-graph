/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DirectedEdgeData, UndirectedEdgeData, VertexData } from '@/types/data';
import {
  Edge,
  Graph as IGraph,
  GraphConnections,
  GraphObserver,
  Vertex
} from '@/types/graphs';
import { Mutable } from '@/types/utils';

export default abstract class Graph<
  V,
  E,
  GV extends Vertex<V, E>,
  GE extends Edge<E, V>,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> implements IGraph<V, E>
{
  protected readonly vertices$: Record<string, GV> = {};
  protected readonly edges$: Record<string, GE> = {};
  protected readonly edgesBetweenVertices$: Record<
    string,
    Record<string, Array<GE>>
  > = {};

  private readonly observers: Array<GraphObserver> = [];

  get vertices(): Array<GV> {
    return Object.values(this.vertices$);
  }

  get edges(): Array<GE> {
    return Object.values(this.edges$);
  }

  get orderedEdges(): Array<{ edge: GE; order: number; edgesCount: number }> {
    const addedEdgesKeys = new Set<string>();
    const result: Array<{ edge: GE; order: number; edgesCount: number }> = [];

    this.edges.forEach(edge => {
      if (addedEdgesKeys.has(edge.key)) {
        return;
      }
      const [v1, v2] = edge.vertices;
      const edgesBetweenVertices =
        this.edgesBetweenVertices$[v1.key]?.[v2.key] || [];
      this.orderEdgesBetweenVertices(edgesBetweenVertices).forEach(
        ({ edge: e, order }) => {
          result.push({
            edge: e,
            order,
            edgesCount: edgesBetweenVertices.length
          });
          addedEdgesKeys.add(edge.key);
        }
      );
    });

    return result;
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

  abstract isDirected(): boolean;

  abstract insertVertex(key: string, value: V, notifyObservers?: boolean): GV;

  abstract insertEdge(
    key: string,
    value: E,
    sourceKey: string,
    targetKey: string,
    notifyObservers?: boolean
  ): GE;

  abstract removeEdge(key: string, notifyObservers?: boolean): E;

  abstract orderEdgesBetweenVertices(
    edges: Array<GE>
  ): Array<{ edge: GE; order: number }>;

  abstract insertBatch(
    data: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<ED>;
    },
    notifyObservers?: boolean
  ): void;

  abstract replaceBatch(
    data: {
      vertices?: Array<VertexData<V>>;
      edges?: Array<ED>;
    },
    notifyObservers?: boolean
  ): void;

  removeBatch(
    data: {
      vertices?: Array<string>;
      edges?: Array<string>;
    },
    notifyObservers = true
  ): void {
    // Remove edges and vertices from graph
    data.edges?.forEach(key => this.removeEdge(key, false));
    data.vertices?.forEach(key => this.removeVertex(key, false));
    // Notify observers after all changes to the graph model are made
    if (notifyObservers) {
      this.notifyChange();
    }
  }

  clear(notifyObservers = true): void {
    // Clear the whole graph
    (this.vertices$ as Mutable<typeof this.vertices$>) = {};
    (this.edges$ as Mutable<typeof this.edges$>) = {};
    (this.edgesBetweenVertices$ as Mutable<typeof this.edgesBetweenVertices$>) =
      {};
    // Notify observers after all changes to the graph model are made
    if (notifyObservers) {
      this.notifyChange();
    }
  }

  addObserver(observer: GraphObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: GraphObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  hasVertex(key: string): boolean {
    return !!this.vertices$[key];
  }

  hasEdge(key: string): boolean {
    return !!this.edges$[key];
  }

  getVertex(key: string): GV | null {
    return this.vertices$[key] ?? null;
  }

  getEdge(key: string): GE | null {
    return this.edges$[key] ?? null;
  }

  getEdgesBetween(vertex1key: string, vertex2key: string): Array<GE> {
    const res = this.edgesBetweenVertices$[vertex1key]?.[vertex2key];
    return res ? [...res] : []; // Create a copy of the array
  }

  removeVertex(key: string, notifyObservers = true): V {
    if (!this.vertices$[key]) {
      throw new Error(`Vertex with key ${key} does not exist.`);
    }

    const vertex = this.vertices$[key] as GV;
    vertex.edges.forEach(edge => {
      this.removeEdge(edge.key);
    });
    delete this.vertices$[key];
    // Notify change if notifyObservers is set to true
    if (notifyObservers) {
      this.notifyChange();
    }

    return vertex.value;
  }

  protected insertVertexObject(vertex: GV, notifyObservers = true): GV {
    if (this.vertices$[vertex.key]) {
      throw new Error(`Vertex with key ${vertex.key} already exists.`);
    }
    this.vertices$[vertex.key] = vertex;
    // Notify change if notifyObservers is set to true
    if (notifyObservers) {
      this.notifyChange();
    }
    return vertex;
  }

  protected insertEdgeObject(edge: GE, notifyObservers = true): GE {
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
    // Notify change if notifyObservers is set to true
    if (notifyObservers) {
      this.notifyChange();
    }
    return edge;
  }

  protected removeEdgeObject(edge: GE, notifyObservers = true): void {
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
    // Notify change if notifyObservers is set to true
    if (notifyObservers) {
      this.notifyChange();
    }
  }

  protected notifyChange(): void {
    this.observers.forEach(observer => {
      observer.graphChanged();
    });
  }
}

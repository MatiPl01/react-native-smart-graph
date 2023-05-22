/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Edge,
  GraphConnections,
  GraphObserver,
  Graph as IGraph,
  Vertex
} from '@/types/graphs';

export default abstract class Graph<
  V,
  E,
  GV extends Vertex<V, E>,
  GE extends Edge<E, V>
> implements IGraph<V, E>
{
  protected readonly vertices$: Record<string, GV> = {};
  protected readonly edges$: Record<string, GE> = {};
  protected readonly edgesBetweenVertices$: Record<
    string,
    Record<string, Array<GE>>
  > = {};

  private readonly observers: Array<GraphObserver<V, E>> = [];

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

  abstract insertVertex(key: string, value: V): GV;

  abstract insertEdge(
    sourceKey: string,
    targetKey: string,
    edgeKey: string,
    value: E
  ): GE;

  abstract removeEdge(key: string): E;

  abstract orderEdgesBetweenVertices(
    edges: Array<GE>
  ): Array<{ edge: GE; order: number }>;

  addObserver(observer: GraphObserver<V, E>): void {
    this.observers.push(observer);
  }

  removeObserver(observer: GraphObserver<V, E>): void {
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

  vertex(key: string) {
    return this.vertices$[key];
  }

  edge(key: string) {
    return this.edges$[key];
  }

  getEdgesBetween(vertex1key: string, vertex2key: string): Array<GE> {
    const res = this.edgesBetweenVertices$[vertex1key]?.[vertex2key];
    return res ? [...res] : []; // Create a copy of the array
  }

  removeVertex(key: string): V {
    if (!this.vertices$[key]) {
      throw new Error(`Vertex with key ${key} does not exist.`);
    }

    const vertex = this.vertices$[key] as GV;
    vertex.edges.forEach(edge => {
      this.removeEdge(edge.key);
    });
    delete this.vertices$[key];
    this.notifyVertexRemoved(vertex);

    return vertex.value;
  }

  protected insertVertexObject(vertex: GV): GV {
    if (this.vertices$[vertex.key]) {
      throw new Error(`Vertex with key ${vertex.key} already exists.`);
    }
    this.vertices$[vertex.key] = vertex;
    this.notifyVertexAdded(vertex);
    return vertex;
  }

  protected insertEdgeObject(edge: GE): GE {
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
    this.notifyEdgeAdded(edge);
    return edge;
  }

  protected removeEdgeObject(edge: GE): void {
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
    this.notifyEdgeRemoved(edge);
  }

  protected notifyEdgeRemoved(edge: GE): void {
    this.observers.forEach(observer => observer.edgeRemoved(edge));
  }

  private notifyEdgeAdded(edge: GE): void {
    this.observers.forEach(observer => observer.edgeAdded(edge));
  }

  private notifyVertexRemoved(vertex: GV): void {
    this.observers.forEach(observer => observer.vertexRemoved(vertex));
  }

  private notifyVertexAdded(vertex: GV): void {
    this.observers.forEach(observer => observer.vertexAdded(vertex));
  }
}

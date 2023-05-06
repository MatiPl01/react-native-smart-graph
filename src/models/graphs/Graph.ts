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

  private readonly observers: Array<GraphObserver<V, E>> = [];

  get vertices(): Array<GV> {
    return Object.values(this.vertices$);
  }

  get edges(): Array<GE> {
    return Object.values(this.edges$);
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
    this.edges$[edge.key] = edge;
    this.notifyEdgeAdded(edge);
    return edge;
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

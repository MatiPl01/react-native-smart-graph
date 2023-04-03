import { Edge, Graph as IGraph, Vertex } from '@/types/graphs';

export default abstract class Graph<
  V,
  E,
  GV extends Vertex<V, E>,
  GE extends Edge<E>
> implements IGraph<V, E>
{
  protected readonly vertices$: Record<string, GV> = {};
  protected readonly edges$: Record<string, GE> = {};

  get vertices(): Array<GV> {
    return Object.values(this.vertices$);
  }

  get edges(): Array<GE> {
    return Object.values(this.edges$);
  }

  hasVertex(key: string): boolean {
    return !!this.vertices$[key];
  }

  hasEdge(key: string): boolean {
    return !!this.edges$[key];
  }

  vertex(key: string): GV {
    if (!this.vertices$[key]) {
      throw new Error(`Vertex with key ${key} does not exist.`);
    }
    return this.vertices$[key] as GV;
  }

  edge(key: string): GE {
    if (!this.edges$[key]) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    return this.edges$[key] as GE;
  }

  abstract insertVertex(key: string, value: V): GV;

  abstract insertEdge(
    sourceKey: string,
    targetKey: string,
    edgeKey: string,
    value: E
  ): GE;

  removeVertex(key: string): V {
    if (!this.vertices$[key]) {
      throw new Error(`Vertex with key ${key} does not exist.`);
    }

    const vertex = this.vertices$[key] as GV;
    vertex.edges.forEach(edge => {
      this.removeEdge(edge.key);
    });
    delete this.vertices$[key];

    return vertex.value;
  }

  abstract removeEdge(key: string): E;

  protected insertVertexObject(vertex: GV): GV {
    if (this.vertices$[vertex.key]) {
      throw new Error(`Vertex with key ${vertex.key} already exists.`);
    }
    this.vertices$[vertex.key] = vertex;
    return vertex;
  }

  protected insertEdgeObject(edge: GE): GE {
    if (this.edges$[edge.key]) {
      throw new Error(`Edge with key ${edge.key} already exists.`);
    }
    this.edges$[edge.key] = edge;
    return edge;
  }
}

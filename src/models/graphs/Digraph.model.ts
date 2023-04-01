import { Graph } from '@/types/graphs';

import DirectedEdge from '../edges/DirectedEdge.model';
import DigraphVertex from '../vertices/DigraphVertex.model';

export default class Digraph<V, E> implements Graph<V, E> {
  private readonly vertices$: Record<string, DigraphVertex<V, E>> = {};
  private readonly edges$: Record<string, DirectedEdge<E, V>> = {};

  get vertices(): Array<DigraphVertex<V, E>> {
    return Object.values(this.vertices$);
  }

  get edges(): Array<DirectedEdge<E, V>> {
    return Object.values(this.edges$);
  }

  get isDirected(): boolean {
    return true;
  }

  hasVertex(key: string): boolean {
    return !!this.vertices$[key];
  }

  hasEdge(key: string): boolean {
    return !!this.edges$[key];
  }

  vertex(key: string): DigraphVertex<V, E> {
    if (!this.vertices$[key]) {
      throw new Error(`Vertex with key ${key} does not exist.`);
    }
    return this.vertices$[key] as DigraphVertex<V, E>;
  }

  edge(key: string): DirectedEdge<E, V> {
    if (!this.edges$[key]) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }
    return this.edges$[key] as DirectedEdge<E, V>;
  }

  insertVertex(key: string, value: V): DigraphVertex<V, E> {
    if (this.vertices$[key]) {
      throw new Error(`Vertex with key ${key} already exists.`);
    }
    const vertex = new DigraphVertex<V, E>(key, value);
    this.vertices$[key] = vertex;
    return vertex;
  }

  insertEdge(
    sourceKey: string,
    targetKey: string,
    edgeKey: string,
    value: E
  ): DirectedEdge<E, V> {
    if (this.edges$[edgeKey]) {
      throw new Error(`Edge with key ${edgeKey} already exists.`);
    }
    if (!this.vertices$[sourceKey]) {
      throw new Error(`Vertex with key ${sourceKey} does not exist.`);
    }
    if (!this.vertices$[targetKey]) {
      throw new Error(`Vertex with key ${targetKey} does not exist.`);
    }
    const source = this.vertices$[sourceKey] as DigraphVertex<V, E>;
    const target = this.vertices$[targetKey] as DigraphVertex<V, E>;

    const edge = new DirectedEdge<E, V>(edgeKey, value, source, target);
    this.edges$[edgeKey] = edge;

    source.addOutEdge(edge);
    target.addInEdge(edge);

    return edge;
  }

  removeVertex(key: string): DigraphVertex<V, E> {
    if (!this.vertices$[key]) {
      throw new Error(`Vertex with key ${key} does not exist.`);
    }

    const vertex = this.vertices$[key] as DigraphVertex<V, E>;
    vertex.edges.forEach(edge => {
      this.removeEdge(edge.key);
    });
    delete this.vertices$[key];

    return vertex;
  }

  removeEdge(key: string): DirectedEdge<E, V> {
    if (!this.edges$[key]) {
      throw new Error(`Edge with key ${key} does not exist.`);
    }

    const edge = this.edges$[key] as DirectedEdge<E, V>;
    const source = edge.source as DigraphVertex<V, E>;
    const target = edge.target as DigraphVertex<V, E>;

    source.removeOutEdge(key);
    target.removeInEdge(key);
    delete this.edges$[key];

    return edge;
  }
}

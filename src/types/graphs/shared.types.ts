// TODO - add documentation to all interfaces

export interface Vertex<V, E> {
  get key(): string;
  get value(): V;
  get edges(): Array<Edge<E>>;
}

export interface Edge<E> {
  get key(): string;
  get value(): E;
}

export interface Graph<V, E> {
  get vertices(): Array<Vertex<V, E>>;
  get edges(): Array<Edge<E>>;
  get isDirected(): boolean;
  hasVertex(key: string): boolean;
  hasEdge(key: string): boolean;
  vertex(key: string): Vertex<V, E>;
  edge(key: string): Edge<E>;
  insertVertex(key: string, value: V): Vertex<V, E>;
  insertEdge(
    sourceKey: string,
    targetKey: string,
    edgeKey: string,
    value: E
  ): Edge<E>;
  removeVertex(key: string): Vertex<V, E>;
  removeEdge(key: string): Edge<E>;
}

// TODO - add documentation to all interfaces

export interface Vertex<V, E> {
  get key(): string;
  get value(): V;
  get edges(): Array<Edge<E, V>>;
  get neighbors(): Array<Vertex<V, E>>;
  get degree(): number;
}

export interface Edge<E, V> {
  get key(): string;
  get value(): E;
  get vertices(): [Vertex<V, E>, Vertex<V, E>];
}

export interface Graph<V, E> {
  get vertices(): Array<Vertex<V, E>>;
  get edges(): Array<Edge<E, V>>;
  isDirected(): boolean;
  hasVertex(key: string): boolean;
  hasEdge(key: string): boolean;
  vertex(key: string): Vertex<V, E>;
  edge(key: string): Edge<E, V>;
  insertVertex(key: string, value: V): Vertex<V, E>;
  insertEdge(
    vertex1key: string,
    vertex2key: string,
    edgeKey: string,
    value: E
  ): Edge<E, V>;
  removeVertex(key: string): V;
  removeEdge(key: string): E;
}

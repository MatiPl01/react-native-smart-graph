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
  isDirected(): boolean;
}

export type GraphConnections = Record<string, Array<string>>;

export type GraphObserver<V, E> = {
  vertexAdded(vertex: Vertex<V, E>): void;
  vertexRemoved(vertex: Vertex<V, E>): void;
  edgeAdded(edge: Edge<E, V>): void;
  edgeRemoved(edge: Edge<E, V>): void;
};

export interface Graph<V, E> {
  get vertices(): Array<Vertex<V, E>>;
  get edges(): Array<Edge<E, V>>;
  get connections(): GraphConnections;
  get connections(): GraphConnections;
  isDirected(): boolean;
  addObserver(observer: GraphObserver<V, E>): void;
  removeObserver(observer: GraphObserver<V, E>): void;
  hasVertex(key: string): boolean;
  hasEdge(key: string): boolean;
  vertex(key: string): Vertex<V, E> | undefined;
  edge(key: string): Edge<E, V> | undefined;
  insertVertex(key: string, value: V, radius: number): Vertex<V, E>;
  insertEdge(
    vertex1key: string,
    vertex2key: string,
    edgeKey: string,
    value: E
  ): Edge<E, V>;
  removeVertex(key: string): V;
  removeEdge(key: string): E;
}

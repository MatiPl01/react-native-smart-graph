export type VertexData<V> = {
  key: string;
  value: V;
};

export type DirectedEdgeData<E> = {
  key: string;
  from: string;
  to: string;
  value: E;
};

export type UndirectedEdgeData<E> = {
  key: string;
  vertices: string[];
  value: E;
};

export type EdgeData<E> = DirectedEdgeData<E> | UndirectedEdgeData<E>;

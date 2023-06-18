export type VertexData<V> = {
  key: string;
  value: V;
};

export type DirectedEdgeData<E> = {
  from: string;
  key: string;
  to: string;
  value: E;
};

export type UndirectedEdgeData<E> = {
  key: string;
  value: E;
  vertices: string[];
};

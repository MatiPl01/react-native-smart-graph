export type VertexData<V> = {
  key: string;
  data: V;
};

export type DirectedEdgeData<E> = {
  key: string;
  from: string;
  to: string;
  data: E;
};

export type UndirectedEdgeData<E> = {
  key: string;
  vertices: [string, string];
  data: E;
};

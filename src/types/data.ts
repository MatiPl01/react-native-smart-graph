export type VertexData<V> = {
  key: string;
  value?: V;
};

export type DirectedEdgeData<E> = {
  from: string;
  key: string;
  to: string;
  value?: E;
};

export type UndirectedEdgeData<E = void> = {
  key: string;
  value?: E;
  vertices: string[];
};

export type GraphData<VD, ED> = {
  edges?: Array<ED>;
  vertices: Array<VD>;
};

export type DirectedGraphData<V = void, E = void> = {
  edges?: Array<DirectedEdgeData<E>>;
  vertices: Array<VertexData<V>>;
};

export type UndirectedGraphData<V = void, E = void> = {
  edges?: Array<UndirectedEdgeData<E>>;
  vertices: Array<VertexData<V>>;
};

export type VertexData<V = void> = {
  key: string;
  value?: V;
};

export type DirectedEdgeData<E = void> = {
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

type GraphData<VD, ED> = {
  edges?: Array<ED>;
  vertices: Array<VD>;
};

export type UndirectedGraphData<V = void, E = void> = GraphData<
  VertexData<V>,
  UndirectedEdgeData<E>
>;

export type DirectedGraphData<V = void, E = void> = GraphData<
  VertexData<V>,
  DirectedEdgeData<E>
>;

export type DataProviderReturnType<P extends object, V> = <
  C extends object = P // This workaround allows passing generic prop types
>(
  props: Omit<C, keyof V>
) => JSX.Element;

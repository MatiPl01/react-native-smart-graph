export type DirectedEdgeData<E = void> = {
  from: string;
  key: string;
  to: string;
  value: E;
};

export type UndirectedEdgeData<E = void> = {
  key: string;
  value: E;
  vertices: Array<string>;
};

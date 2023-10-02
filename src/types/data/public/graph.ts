import { DirectedEdgeData, UndirectedEdgeData } from './edge';
import { VertexData } from './vertex';

type GraphData<VD, ED> = {
  edges?: Array<ED>;
  vertices: Array<VD>;
};

export type UndirectedGraphData<V = unknown, E = unknown> = GraphData<
  VertexData<V>,
  UndirectedEdgeData<E>
>;

export type DirectedGraphData<V = unknown, E = unknown> = GraphData<
  VertexData<V>,
  DirectedEdgeData<E>
>;

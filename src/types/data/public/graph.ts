import { DirectedEdgeData, UndirectedEdgeData } from './edge';
import { VertexData } from './vertex';

type GraphData<VD, ED> = {
  edges?: Array<ED>;
  vertices: Array<VD>;
};

export type UndirectedGraphData<V = undefined, E = undefined> = GraphData<
  VertexData<V>,
  UndirectedEdgeData<E>
>;

export type DirectedGraphData<V = undefined, E = undefined> = GraphData<
  VertexData<V>,
  DirectedEdgeData<E>
>;

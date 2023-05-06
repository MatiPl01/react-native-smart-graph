import { EdgeLabelRendererFunction, VertexRenderFunction } from '.';
import { AnimatedVector } from '../layout';

export type UndirectedEdgeRendererProps<E> = {
  key: string;
  data: E;
  points: [AnimatedVector, AnimatedVector];
};

export type UndirectedEdgeRenderFunction<E> = (
  props: UndirectedEdgeRendererProps<E>
) => JSX.Element | null;

export type UndirectedGraphRenderers<V, E> = {
  vertex?: VertexRenderFunction<V>;
  edge?: UndirectedEdgeRenderFunction<E>;
  edgeLabel?: EdgeLabelRendererFunction<E>;
};

export type UndirectedEdgeRenderers<E> = {
  edge: UndirectedEdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
};

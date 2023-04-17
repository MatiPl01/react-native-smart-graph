import { SharedValue } from 'react-native-reanimated';

import { VertexRenderFunction } from '.';

export type UndirectedEdgeRendererProps<E> = {
  key: string;
  data: E;
  points: [
    SharedValue<{ x: number; y: number }>,
    SharedValue<{ x: number; y: number }>
  ];
};

export type UndirectedEdgeRenderFunction<E> = (
  props: UndirectedEdgeRendererProps<E>
) => JSX.Element | null;

export type UndirectedGraphRenderers<V, E> = {
  vertex?: VertexRenderFunction<V>;
  edge?: UndirectedEdgeRenderFunction<E>;
  edgeLabel?: UndirectedEdgeRenderFunction<E>;
};

export type UndirectedEdgeRenderers<E> = {
  edge: UndirectedEdgeRenderFunction<E>;
  label?: UndirectedEdgeRenderFunction<E>;
};

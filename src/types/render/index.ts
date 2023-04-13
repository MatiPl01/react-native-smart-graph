import { SharedValue } from 'react-native-reanimated';

export type VertexRendererProps<V> = {
  key: string;
  data: V;
  radius: number;
  position: {
    x: SharedValue<number>;
    y: SharedValue<number>;
  };
};

export type DirectedEdgeRendererProps<E> = {
  key: string;
  data: E;
  from: SharedValue<{ x: number; y: number }>;
  to: SharedValue<{ x: number; y: number }>;
};

export type UndirectedEdgeRendererProps<E> = {
  key: string;
  data: E;
  points: [
    SharedValue<{ x: number; y: number }>,
    SharedValue<{ x: number; y: number }>
  ];
};

export type EdgeRendererProps<E> =
  | DirectedEdgeRendererProps<E>
  | UndirectedEdgeRendererProps<E>;

export type VertexRenderFunction<V> = (
  props: VertexRendererProps<V>
) => JSX.Element | null;

export type EdgeRenderFunction<E> =
  | DirectedEdgeRenderFunction<E>
  | UndirectedEdgeRenderFunction<E>;

export type DirectedEdgeRenderFunction<E> = (
  props: DirectedEdgeRendererProps<E>
) => JSX.Element | null;

export type UndirectedEdgeRenderFunction<E> = (
  props: UndirectedEdgeRendererProps<E>
) => JSX.Element | null;

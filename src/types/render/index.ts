import { SharedValue } from 'react-native-reanimated';

export type AnimatedPosition = {
  x: SharedValue<number>;
  y: SharedValue<number>;
};

export type VertexRendererProps<V> = {
  key: string;
  data: V;
  radius: number;
  position: AnimatedPosition;
};

export type DirectedEdgeRendererProps<E, V> = {
  key: string;
  data: E;
  from: { x: number; y: number }; // TODO - use AnimatedPosition
  to: { x: number; y: number };
};

export type UndirectedEdgeRendererProps<E, V> = {
  key: string;
  data: E;
  vertices: [{ x: number; y: number }, { x: number; y: number }];
};

export type EdgeRendererProps<E, V> =
  | DirectedEdgeRendererProps<E, V>
  | UndirectedEdgeRendererProps<E, V>;

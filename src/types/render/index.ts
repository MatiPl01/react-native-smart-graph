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

export type DirectedEdgeRendererProps<E, V> = {
  key: string;
  data: E;
  from: SharedValue<{ x: number; y: number }>;
  to: SharedValue<{ x: number; y: number }>;
};

export type UndirectedEdgeRendererProps<E, V> = {
  key: string;
  data: E;
  points: [
    SharedValue<{ x: number; y: number }>,
    SharedValue<{ x: number; y: number }>
  ];
};

export type EdgeRendererProps<E, V> =
  | DirectedEdgeRendererProps<E, V>
  | UndirectedEdgeRendererProps<E, V>;

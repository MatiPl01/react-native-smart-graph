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

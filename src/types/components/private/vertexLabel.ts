import { SharedValue } from 'react-native-reanimated';

import { VertexLabelRenderer } from '@/types/components/public';
import { VertexLabelComponentData } from '@/types/data';

export type VertexLabelComponentProps<V = undefined> = {
  data: VertexLabelComponentData<V>;
  renderer: VertexLabelRenderer<V>;
  vertexKey: string;
  vertexRadius: number;
  // settings: Verlacom // TODO
};

export type GraphVerticesLabelsProps<V> = {
  focusProgress: SharedValue<number>;
  renderer: VertexLabelRenderer<V> | null;
  vertexLabelsData: Record<string, VertexLabelComponentData<V>>;
  vertexRadius: number;
};

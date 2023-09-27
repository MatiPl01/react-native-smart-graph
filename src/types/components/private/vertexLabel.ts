import { SharedValue } from 'react-native-reanimated';

import { FocusContextType } from '@/providers/view';
import { VertexLabelRenderer } from '@/types/components/public';
import { VertexLabelComponentData } from '@/types/data';
import { VertexLabelPosition } from '@/types/settings';

export type VertexLabelComponentProps<V = undefined> = {
  data: VertexLabelComponentData<V>;
  focusContext: FocusContextType;
  labelPosition: SharedValue<VertexLabelPosition>;
  renderer: VertexLabelRenderer<V>;
  vertexKey: string;
  vertexRadius: number;
};

export type GraphVerticesLabelsProps<V> = {
  focusContext: FocusContextType;
  labelPosition: SharedValue<VertexLabelPosition>;
  renderer: VertexLabelRenderer<V> | null;
  vertexLabelsData: Record<string, VertexLabelComponentData<V>>;
  vertexRadius: number;
};

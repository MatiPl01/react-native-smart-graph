import { SharedValue } from 'react-native-reanimated';

import { MultiStepFocusContextType } from '@/providers/graph';
import { FocusContextType } from '@/providers/view';
import { VertexLabelRenderer } from '@/types/components/public';
import { VertexLabelComponentData } from '@/types/data';
import { VertexLabelPosition } from '@/types/settings';

export type VertexLabelComponentProps<V = undefined> = {
  data: VertexLabelComponentData<V>;
  focusContext: FocusContextType;
  labelPosition: SharedValue<VertexLabelPosition>;
  multiStepFocusContext: MultiStepFocusContextType;
  renderer: VertexLabelRenderer<V>;
  vertexRadius: number;
};

export type GraphVerticesLabelsProps<V> = Omit<
  VertexLabelComponentProps<V>,
  'data' | 'renderer'
> & {
  renderer: VertexLabelRenderer<V> | null;
  vertexLabelsData: Record<string, VertexLabelComponentData<V>>;
};

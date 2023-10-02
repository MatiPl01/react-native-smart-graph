import { SharedValue } from 'react-native-reanimated';

import { MultiStepFocusContextType } from '@/providers/graph';
import { FocusContextType } from '@/providers/view';
import { VertexLabelRenderer } from '@/types/components/public';
import { VertexLabelComponentData } from '@/types/data';
import { VertexLabelPosition } from '@/types/settings';
import { RendererWithProps } from '@/types/utils';

export type VertexLabelComponentProps<V = unknown> = {
  data: VertexLabelComponentData<V>;
  focusContext: FocusContextType;
  labelPosition: SharedValue<VertexLabelPosition>;
  multiStepFocusContext: MultiStepFocusContextType | null;
  renderer: RendererWithProps<VertexLabelRenderer<V>>;
  vertexRadius: number;
};

export type GraphVerticesLabelsProps<V> = Omit<
  VertexLabelComponentProps<V>,
  'data' | 'renderer'
> & {
  renderer: RendererWithProps<VertexLabelRenderer<V>> | null;
  vertexLabelsData: Record<string, VertexLabelComponentData<V>>;
};

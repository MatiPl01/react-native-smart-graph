import { SharedValue } from 'react-native-reanimated';

import { MultiStepFocusContextType } from '@/providers/graph/focus';
import { FocusContextType } from '@/providers/view';
import { VertexRenderer } from '@/types/components/public';
import { VertexComponentData, VertexRemoveHandler } from '@/types/data';
import {
  InternalVertexLabelSettings,
  InternalVertexSettings
} from '@/types/settings';
import { RendererWithProps } from '@/types/utils';

export type VertexComponentProps<V> = {
  data: VertexComponentData<V>;
  focusContext: FocusContextType;
  labelsRendered: SharedValue<boolean>;
  multiStepFocusContext: MultiStepFocusContextType | null;
  onRemove: VertexRemoveHandler;
  renderer: RendererWithProps<VertexRenderer<V>>;
  settings: {
    label: InternalVertexLabelSettings;
    vertex: InternalVertexSettings;
  };
};

export type GraphVerticesProps<V> = Omit<
  VertexComponentProps<V>,
  'data' | 'renderer' | 'settings'
> & {
  labelSettings: InternalVertexLabelSettings;
  labelsRendered: SharedValue<boolean>;
  renderer: RendererWithProps<VertexRenderer<V>> | null;
  vertexSettings: InternalVertexSettings;
  verticesData: Record<string, VertexComponentData<V>>;
};

import { MultiStepFocusContextType } from '@/providers/graph/focus';
import { FocusContextType } from '@/providers/view';
import { VertexRenderer } from '@/types/components/public';
import { VertexComponentData, VertexRemoveHandler } from '@/types/data';
import { InternalVertexSettings } from '@/types/settings';

export type VertexComponentProps<V> = {
  data: VertexComponentData<V>;
  focusContext: FocusContextType;
  multiStepFocusContext: MultiStepFocusContextType;
  onRemove: VertexRemoveHandler;
  renderer: VertexRenderer<V>;
  settings: InternalVertexSettings;
};

export type GraphVerticesProps<V> = Omit<
  VertexComponentProps<V>,
  'data' | 'renderer'
> & {
  renderer: VertexRenderer<V> | null;
  verticesData: Record<string, VertexComponentData<V>>;
};

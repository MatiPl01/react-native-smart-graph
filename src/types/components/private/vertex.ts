import { FocusContextType } from '@/providers/view';
import { VertexRenderer } from '@/types/components/public';
import { VertexComponentData, VertexRemoveHandler } from '@/types/data';
import { InternalVertexSettings } from '@/types/settings';

/* eslint-disable import/no-unused-modules */
export type VertexComponentProps<V, E> = VertexComponentData<V, E> & {
  focusContext: FocusContextType;
  onRemove: VertexRemoveHandler;
  renderer: VertexRenderer<V>;
  settings: InternalVertexSettings;
};

export type GraphVerticesProps<V, E> = {
  focusContext: FocusContextType;
  onRemove: VertexRemoveHandler;
  renderer: VertexRenderer<V>;
  settings: InternalVertexSettings;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

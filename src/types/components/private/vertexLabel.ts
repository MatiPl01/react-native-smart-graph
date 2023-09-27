import { FocusContextType } from '@/providers/view';
import { VertexLabelRenderer } from '@/types/components/public';
import { VertexLabelComponentData } from '@/types/data';

export type VertexLabelComponentProps<V = undefined> = {
  data: VertexLabelComponentData<V>;
  focusContext: FocusContextType;
  renderer: VertexLabelRenderer<V>;
  vertexKey: string;
  vertexRadius: number;
  // settings: Verlacom // TODO
};

export type GraphVerticesLabelsProps<V> = {
  focusContext: FocusContextType;
  renderer: VertexLabelRenderer<V> | null;
  vertexLabelsData: Record<string, VertexLabelComponentData<V>>;
  vertexRadius: number;
};

import { EdgeLabelRenderer } from '@/types/components/public';
import { EdgeLabelComponentData } from '@/types/data';

export type EdgeLabelComponentProps<E = undefined> = {
  data: EdgeLabelComponentData<E>;
  edgeKey: string;
  renderer: EdgeLabelRenderer<E>;
  value?: E;
  vertexRadius: number;
};

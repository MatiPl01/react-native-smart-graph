import { LabelRenderer } from '@/types/components/public';
import { LabelComponentData } from '@/types/data';

export type LabelComponentProps<E = undefined> = {
  data: LabelComponentData<E>;
  edgeKey: string;
  renderer: LabelRenderer<E>;
  value?: E;
  vertexRadius: number;
};

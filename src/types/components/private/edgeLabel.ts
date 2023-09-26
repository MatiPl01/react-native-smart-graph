import { SharedValue } from 'react-native-reanimated';

import { EdgeLabelRenderer } from '@/types/components/public';
import { EdgeLabelComponentData } from '@/types/data';

export type EdgeLabelComponentProps<E = undefined> = {
  data: EdgeLabelComponentData<E>;
  edgeKey: string;
  renderer: EdgeLabelRenderer<E>;
  vertexRadius: number;
};

export type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  focusProgress: SharedValue<number>;
  renderer: EdgeLabelRenderer<E> | null;
  vertexRadius: number;
};

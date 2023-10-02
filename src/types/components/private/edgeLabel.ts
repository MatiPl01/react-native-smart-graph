import { SharedValue } from 'react-native-reanimated';

import { EdgeLabelRenderer } from '@/types/components/public';
import { EdgeLabelComponentData } from '@/types/data';
import { RendererWithProps } from '@/types/utils';

export type EdgeLabelComponentProps<E = unknown> = {
  data: EdgeLabelComponentData<E>;
  edgeKey: string;
  renderer: RendererWithProps<EdgeLabelRenderer<E>>;
  vertexRadius: number;
};

export type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  focusProgress: SharedValue<number>;
  renderer: RendererWithProps<EdgeLabelRenderer<E>> | null;
  vertexRadius: number;
};

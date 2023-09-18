import { VertexMaskRenderer } from '@/types/components/public';
import { VertexComponentData } from '@/types/data';

export type GraphEdgesMaskProps<V> = {
  renderer: VertexMaskRenderer;
  vertexRadius: number;
  verticesData: Record<string, VertexComponentData<V>>;
};

export type VertexMaskComponentProps<V> = {
  data: VertexComponentData<V>;
  radius: number;
  renderer: VertexMaskRenderer;
};

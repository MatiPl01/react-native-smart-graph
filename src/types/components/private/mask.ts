import { VertexMaskRenderer } from '@/types/components/public';
import { VertexComponentData } from '@/types/data';
import { RendererWithProps } from '@/types/utils';

export type GraphEdgesMaskProps<V> = {
  renderer: RendererWithProps<VertexMaskRenderer>;
  vertexRadius: number;
  verticesData: Record<string, VertexComponentData<V>>;
};

export type VertexMaskComponentProps<V> = {
  data: VertexComponentData<V>;
  radius: number;
  renderer: RendererWithProps<VertexMaskRenderer>;
};

import { PropsWithChildren } from 'react';

import { withGraphData } from '@/providers/graph/data';
import { AnimatedCanvasTransform } from '@/types/canvas';
import {
  VertexComponentData,
  VertexComponentRenderData
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { GraphEventsSettings } from '@/types/settings';

export type PressEventsProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<{
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphEventsSettings<V, E, ED>;
  transform: AnimatedCanvasTransform;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function PressEventsProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({ children }: PressEventsProviderProps<V, E, ED>) {
  return <>{children}</>;
}

export default withGraphData(
  PressEventsProvider,
  ({ renderedVerticesData, verticesData }) => ({
    renderedVerticesData,
    verticesData
  })
);

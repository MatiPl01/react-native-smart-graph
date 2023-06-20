import { PropsWithChildren } from 'react';

import { withGraphData } from '@/providers/data';
import { VertexComponentRenderData } from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { PressEventsCallbacks } from '@/types/settings/graph/events';

export type PressEventsProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<{
  callbacks: PressEventsCallbacks<V, E, ED>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
}>;

function PressEventsProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  callbacks,
  children,
  renderedVerticesData
}: PressEventsProviderProps<V, E, ED>) {
  return <>{children}</>;
}

export default withGraphData(
  PressEventsProvider,
  ({ renderedVerticesData }) => ({
    renderedVerticesData
  })
);

import { PropsWithChildren, useEffect } from 'react';
import { View } from 'react-native';

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
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
}>;

function PressEventsProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  callbacks,
  children,
  renderLayer,
  renderedVerticesData
}: PressEventsProviderProps<V, E, ED>) {
  useEffect(() => {
    renderLayer(1, <View style={{ backgroundColor: 'red', flex: 1 }} />);
  }, []);

  return <>{children}</>;
}

export default withGraphData(
  PressEventsProvider,
  ({ renderedVerticesData }) => ({
    renderedVerticesData
  })
);

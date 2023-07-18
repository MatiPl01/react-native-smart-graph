import { PropsWithChildren, useEffect } from 'react';

// eslint-disable-next-line import/default
import { withGraphData } from '@/providers/graph';
import { AnimatedCanvasTransform } from '@/types/canvas';
import {
  VertexComponentData,
  VertexComponentRenderData
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { AnimatedBoundingRect } from '@/types/layout';
import { GraphEventsSettings } from '@/types/settings';

import OverlayLayer from './OverlayLayer';

export type PressEventsProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<{
  boundingRect: AnimatedBoundingRect;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphEventsSettings<V, E, ED>;
  transform: AnimatedCanvasTransform;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function PressEventsProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  boundingRect,
  children,
  renderLayer,
  renderedVerticesData,
  settings,
  transform,
  verticesData
}: PressEventsProviderProps<V, E, ED>) {
  useEffect(() => {
    renderLayer(
      1,
      <OverlayLayer
        boundingRect={boundingRect}
        renderedVerticesData={renderedVerticesData}
        settings={settings}
        transform={transform}
        verticesData={verticesData}
      />
    );
  }, [
    renderedVerticesData,
    settings?.onVertexPress,
    settings?.onVertexLongPress
  ]);

  return <>{children}</>;
}

export default withGraphData(
  PressEventsProvider,
  ({ renderedVerticesData, verticesData }) => ({
    renderedVerticesData,
    verticesData
  })
);

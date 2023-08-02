import { PropsWithChildren, useEffect } from 'react';

import { withGraphData } from '@/providers/graph';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { VertexComponentData } from '@/types/components';
import { GraphEventsSettings } from '@/types/settings';

import OverlayLayer from './OverlayLayer';

export type PressEventsProviderProps<V, E> = PropsWithChildren<{
  settings: GraphEventsSettings<V>;
  transform: AnimatedCanvasTransform;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function PressEventsProvider<V, E>({
  children,
  settings,
  transform,
  verticesData
}: PressEventsProviderProps<V, E>) {
  const {
    dataContext: { boundingRect },
    overlayContext: { removeLayer, renderLayer }
  } = useCanvasContexts();

  useEffect(() => {
    renderLayer(
      1,
      <OverlayLayer
        boundingRect={boundingRect}
        settings={settings}
        transform={transform}
        verticesData={verticesData}
      />
    );

    return () => {
      removeLayer(1);
    };
  }, [verticesData, settings?.onVertexPress, settings?.onVertexLongPress]);

  return <>{children}</>;
}

export default withGraphData(PressEventsProvider, ({ verticesData }) => ({
  verticesData
}));

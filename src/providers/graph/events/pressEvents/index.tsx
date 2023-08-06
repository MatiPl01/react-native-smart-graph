import { PropsWithChildren, useEffect } from 'react';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { VertexComponentData } from '@/types/data';
import { AnimatedTransformation } from '@/types/layout';
import { GraphEventsSettings } from '@/types/settings';

import OverlayLayer from './OverlayLayer';

export type PressEventsProviderProps<V, E> = PropsWithChildren<{
  settings: GraphEventsSettings<V>;
  transform: AnimatedTransformation;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function PressEventsProvider<V, E>({
  children,
  settings,
  transform,
  verticesData
}: PressEventsProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
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

export default withGraphSettings(
  withComponentsData(PressEventsProvider, ({ verticesData }) => ({
    verticesData
  })),
  ({ settings }) => ({ settings: settings.events })
);

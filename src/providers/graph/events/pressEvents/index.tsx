import { PropsWithChildren, useEffect } from 'react';

import { useCanvasContexts } from '@/providers/graph/contexts';

import OverlayLayer from './OverlayLayer';
import { GraphEventsSettings } from '@/types/settings';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { VertexComponentData } from '@/types/components';
import { withComponentsData } from '../../data/components/context';
import { withGraphSettings } from '../../data/settings/context';

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
  ({ settings }) => ({ events: settings.events })
);

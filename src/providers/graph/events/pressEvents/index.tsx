import { PropsWithChildren, useEffect } from 'react';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { VertexComponentData } from '@/types/data';
import { AnimatedTransformation } from '@/types/layout';
import { PressEventsSettings } from '@/types/settings';

import OverlayLayer from './OverlayLayer';

export type PressEventsProviderProps<V> = PropsWithChildren<{
  settings: PressEventsSettings<V>;
  transform: AnimatedTransformation;
  verticesData: Record<string, VertexComponentData<V>>;
}>;

function PressEventsProvider<V>({
  children,
  settings,
  transform,
  verticesData
}: PressEventsProviderProps<V>) {
  // CONTEXTS
  // Canvas contexts
  const {
    dataContext: { boundingRect },
    overlayContext: { removeLayer, renderLayer }
  } = useCanvasContexts();

  useEffect(() => {
    renderLayer(
      1,
      <OverlayLayer // TODO - think of better solution (this layer re-renders every overlay vertex every time this useEffect is called)
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
  ({ settings }) => ({ settings: settings.events?.press })
);

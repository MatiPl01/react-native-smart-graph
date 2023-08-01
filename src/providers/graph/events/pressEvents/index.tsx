import { PropsWithChildren, useEffect } from 'react';

// eslint-disable-next-line import/default
import { withGraphData } from '@/providers/graph';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { VertexComponentData } from '@/types/components';
import { AnimatedBoundingRect } from '@/types/layout';
import { GraphEventsSettings } from '@/types/settings';

import OverlayLayer from './OverlayLayer';

export type PressEventsProviderProps<V, E> = PropsWithChildren<{
  boundingRect: AnimatedBoundingRect;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
  settings: GraphEventsSettings<V>;
  transform: AnimatedCanvasTransform;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function PressEventsProvider<V, E>({
  boundingRect,
  children,
  renderLayer,
  settings,
  transform,
  verticesData
}: PressEventsProviderProps<V, E>) {
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
  }, [verticesData, settings?.onVertexPress, settings?.onVertexLongPress]);

  return <>{children}</>;
}

export default withGraphData(PressEventsProvider, ({ verticesData }) => ({
  verticesData
}));

import { PropsWithChildren, useEffect } from 'react';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { VertexComponentData } from '@/types/data';
import { AnimatedTransformation } from '@/types/layout';
import {
  InternalPressEventsSettings,
  InternalVertexSettings
} from '@/types/settings';

import OverlayLayer from './OverlayLayer';

export type PressEventsProviderProps<V> = PropsWithChildren<{
  pressSettings: InternalPressEventsSettings<V>;
  transform: AnimatedTransformation;
  vertexSettings: InternalVertexSettings;
  verticesData: Record<string, VertexComponentData<V>>;
}>;

function PressEventsProvider<V>({
  children,
  pressSettings,
  transform,
  vertexSettings,
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
        pressSettings={pressSettings}
        transform={transform}
        vertexSettings={vertexSettings}
        verticesData={verticesData}
      />
    );

    return () => {
      removeLayer(1);
    };
  }, [verticesData, PressEventsProvider, vertexSettings]);

  return <>{children}</>;
}

export default withGraphSettings(
  withComponentsData(PressEventsProvider, ({ verticesData }) => ({
    verticesData
  })),
  ({ componentSettings, eventSettings }) => ({
    pressSettings: eventSettings?.press,
    vertexSettings: componentSettings.vertex
  })
);

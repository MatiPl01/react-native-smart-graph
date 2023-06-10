import { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { useFrameCallback } from 'react-native-reanimated';

import { useComponentsDataContext } from '@/providers/ComponentsDataProvider';
import { Graph } from '@/types/graphs';
import {
  ForcesSettingsWithDefaults,
  GraphLayout,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import { placeVertices } from '@/utils/placement';

type ForcesLayoutProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  settings: GraphSettingsWithDefaults<V, E>;
}>;

export default function ForcesLayoutProvider<V, E>({
  graph,
  settings,
  children
}: ForcesLayoutProviderProps<V, E>) {
  const { layoutAnimationSettings, verticesRenderData, edgesRenderData } =
    useComponentsDataContext();
  const isFirstRenderRef = useRef(true);

  const initialLayout = useMemo<GraphLayout>(
    () =>
      placeVertices(
        graph,
        settings.components.vertex.radius,
        settings.placement
      ),
    [graph, settings]
  );

  const connections = useMemo(
    () => graph.connections,
    [verticesRenderData, edgesRenderData]
  );

  const { setActive } = useFrameCallback(() => {
    applyForces(
      connections,
      Object.fromEntries(
        Object.entries(verticesRenderData).map(([key, { position }]) => [
          key,
          position
        ])
      ),
      (settings.layout.managedBy === 'forces'
        ? settings.layout.settings
        : undefined) as unknown as ForcesSettingsWithDefaults // TODO
    );
  }, false);

  useEffect(() => {
    if (
      isFirstRenderRef.current &&
      // TODO - fix this temporary comparison
      Object.keys(verticesRenderData).length ===
        Object.keys(initialLayout.verticesPositions).length
    ) {
      isFirstRenderRef.current = false;
      // Animate vertices using placement settings
      animateVerticesToFinalPositions(
        Object.fromEntries(
          Object.entries(verticesRenderData).map(([key, { position }]) => [
            key,
            position
          ])
        ),
        initialLayout.verticesPositions,
        layoutAnimationSettings
      );
      // Start forces simulation
      setActive(true);
    }
  }, [verticesRenderData]);

  return <>{children}</>;
}

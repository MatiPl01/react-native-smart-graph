import { PropsWithChildren, useEffect, useMemo } from 'react';

import { useComponentsDataContext } from '@/providers/ComponentsDataProvider';
import { Graph } from '@/types/graphs';
import { GraphLayout, GraphSettingsWithDefaults } from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { placeVertices } from '@/utils/placement';

type PlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  settings: GraphSettingsWithDefaults<V, E>;
}>;

export default function PlacementLayoutProvider<V, E>({
  graph,
  settings,
  children
}: PlacementLayoutProviderProps<V, E>) {
  const { layoutAnimationSettings, verticesRenderData, edgesRenderData } =
    useComponentsDataContext();

  const graphLayout = useMemo<GraphLayout>(
    () =>
      placeVertices(
        graph,
        settings.components.vertex.radius,
        settings.placement
      ),
    [verticesRenderData, edgesRenderData, settings]
  );

  useEffect(() => {
    animateVerticesToFinalPositions(
      Object.fromEntries(
        Object.entries(verticesRenderData).map(([key, { position }]) => [
          key,
          position
        ])
      ),
      graphLayout.verticesPositions,
      layoutAnimationSettings
    );
  }, [graphLayout]);

  return <>{children}</>;
}

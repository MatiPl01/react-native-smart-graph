import { PropsWithChildren } from 'react';

import { withGraphData } from '@/providers/ComponentsDataProvider';
import {
  EdgeComponentRenderData,
  VertexComponentRenderData
} from '@/types/components';
import { Graph } from '@/types/graphs';
import { GraphSettingsWithDefaults } from '@/types/settings';

export type GraphPlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  // Component props
  graph: Graph<V, E>;
  settings: GraphSettingsWithDefaults<V, E>;
  // Injected props
  verticesRenderData: Record<string, VertexComponentRenderData>;
  edgesRenderData: Record<string, EdgeComponentRenderData>;
}>;

function GraphPlacementLayoutProvider<V, E>({
  children
}: GraphPlacementLayoutProviderProps<V, E>) {
  return <>{children}</>;
}

export default withGraphData(
  GraphPlacementLayoutProvider,
  ({ verticesRenderData, edgesRenderData }) => ({
    verticesRenderData,
    edgesRenderData
  })
);

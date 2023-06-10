import { PropsWithChildren } from 'react';

import { Graph } from '@/types/graphs';
import { GraphAnimationsSettingsWithDefaults } from '@/types/settings/graph/animations';
import { GraphLayoutSettingsWithDefaults } from '@/types/settings/graph/layout';

type GraphLayoutProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  layoutSettings: GraphLayoutSettingsWithDefaults;
  animationsSettings: GraphAnimationsSettingsWithDefaults;
}>;

export default function GraphLayoutProvider<V, E>({
  graph,
  placementSettings,
  animationsSettings,
  children
}: GraphLayoutProviderProps<V, E>) {
  return <>{children}</>;
}

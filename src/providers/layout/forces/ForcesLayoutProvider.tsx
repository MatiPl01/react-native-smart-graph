import { PropsWithChildren } from 'react';
import { useFrameCallback } from 'react-native-reanimated';

import { withGraphData } from '@/providers/ComponentsDataProvider';
import { GraphConnections } from '@/types/graphs';
import { ForcesSettingsWithDefaults } from '@/types/settings';
import { applyForces } from '@/utils/forces';

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps = PropsWithChildren<{
  // Component props
  forcesSettings: ForcesSettingsWithDefaults;
  // Injected props
  connections: GraphConnections;
}>;

function ForcesLayoutProvider({
  forcesSettings,
  connections,
  children
}: ForcesLayoutProviderProps) {
  const { placedVerticesPositions } = useForcesPlacementContext();

  useFrameCallback(() => {
    applyForces(connections, placedVerticesPositions, forcesSettings);
  });

  return <>{children}</>;
}

export default withGraphData(ForcesLayoutProvider, ({ connections }) => ({
  connections
}));

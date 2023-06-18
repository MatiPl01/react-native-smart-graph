import { PropsWithChildren } from 'react';
import { useFrameCallback } from 'react-native-reanimated';

import { withGraphData } from '@/providers/data';
import { GraphConnections } from '@/types/graphs';
import { ForcesSettingsWithDefaults } from '@/types/settings';
import { applyForces } from '@/utils/forces';

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps = PropsWithChildren<{
  // Injected props
  connections: GraphConnections;
  // Component props
  forcesSettings: ForcesSettingsWithDefaults;
}>;

function ForcesLayoutProvider({
  children,
  connections,
  forcesSettings
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

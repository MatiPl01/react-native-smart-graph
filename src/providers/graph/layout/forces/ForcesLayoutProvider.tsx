import { PropsWithChildren } from 'react';
import { useFrameCallback } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph/data';
import { GraphConnections } from '@/types/graphs';
import { ForcesSettingsWithDefaults } from '@/types/settings';
import { applyForces } from '@/utils/forces';

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps = PropsWithChildren<{
  connections: GraphConnections;
  forcesSettings: ForcesSettingsWithDefaults;
}>;

function ForcesLayoutProvider({
  children,
  connections,
  forcesSettings
}: ForcesLayoutProviderProps) {
  const { lockedVertices, placedVerticesPositions } =
    useForcesPlacementContext();

  useFrameCallback(() => {
    applyForces(
      connections,
      lockedVertices,
      placedVerticesPositions,
      forcesSettings
    );
  });

  return <>{children}</>;
}

export default withGraphData(ForcesLayoutProvider, ({ connections }) => ({
  connections
}));

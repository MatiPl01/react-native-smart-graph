import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { runOnUI } from 'react-native-reanimated';

import { withGraphData } from '@/providers/data/ComponentsDataProvider';
import { VertexComponentRenderData } from '@/types/components';
import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { ForcesSettingsWithDefaults } from '@/types/settings';
import { updateNewVerticesPositions } from '@/utils/forces';

type ForcesPlacementContextType = {
  placedVerticesPositions: Record<string, AnimatedVectorCoordinates>;
};

const ForcesPlacementContext = createContext({});

export const useForcesPlacementContext = () => {
  const value = useContext(ForcesPlacementContext);

  if (!value) {
    throw new Error(
      'useForcesPlacementContext must be used within a ForcesPlacementProvider'
    );
  }

  return value as ForcesPlacementContextType;
};

type ForcesPlacementProviderProps = PropsWithChildren<{
  // Injected props
  connections: GraphConnections;
  forcesSettings: ForcesSettingsWithDefaults;
  // Component props
  vertexRadius: number;
  verticesRenderData: Record<string, VertexComponentRenderData>;
}>;

function ForcesPlacementProvider({
  children,
  connections,
  forcesSettings,
  vertexRadius,
  verticesRenderData
}: ForcesPlacementProviderProps) {
  // Use separate array with rendered vertices data to ensure that the
  // ForcesLayoutProvider will not try to move vertices that aren't
  // correctly positioned yet (By default vertices are positioned at
  // the center of the graph container resulting in rendering them one
  // on top of another. The resulting forces are then too big and
  // vertices are moved too far away from each other)
  const [placedVerticesPositions, setPlacedVerticesPositions] = useState<
    Record<string, AnimatedVectorCoordinates>
  >({});

  useEffect(() => {
    runOnUI(updateNewVerticesPositions)(
      placedVerticesPositions,
      verticesRenderData,
      connections,
      vertexRadius,
      forcesSettings
    );

    // Update the state
    setPlacedVerticesPositions(
      Object.fromEntries(
        Object.entries(verticesRenderData).map(([key, { position }]) => [
          key,
          position
        ])
      )
    );
  }, [verticesRenderData]);

  const contextValue = useMemo<ForcesPlacementContextType>(
    () => ({
      placedVerticesPositions
    }),
    [placedVerticesPositions]
  );

  return (
    <ForcesPlacementContext.Provider value={contextValue}>
      {children}
    </ForcesPlacementContext.Provider>
  );
}

export default withGraphData(
  ForcesPlacementProvider,
  ({ connections, verticesRenderData }) => ({
    connections,
    verticesRenderData
  })
);

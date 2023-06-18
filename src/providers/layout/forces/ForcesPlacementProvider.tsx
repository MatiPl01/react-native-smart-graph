import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { withGraphData } from '@/providers/ComponentsDataProvider';
import { VertexComponentRenderData } from '@/types/components';
import { AnimatedVectorCoordinates } from '@/types/layout';

export type ForcesPlacementContextType = {
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
  verticesRenderData: Record<string, VertexComponentRenderData>;
}>;

function ForcesPlacementProvider({
  children,
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
    // Find vertices that are not yet placed
    const notPlacedVertices = Object.entries(verticesRenderData).filter(
      ([key]) => !placedVerticesPositions[key]
    );

    // TODO - replace this random placement with a proper one
    // Set random positions to all not placed vertices
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    notPlacedVertices.forEach(([_, { position }]) => {
      position.x.value = Math.random() * 1000;
      position.y.value = Math.random() * 1000;
    });

    // Update placed vertices data
    setPlacedVerticesPositions({
      // Remove vertices that no longer exist
      ...Object.fromEntries(
        Object.entries(placedVerticesPositions).filter(
          ([key]) => verticesRenderData[key]
        )
      ),
      // Add new vertices
      ...Object.fromEntries(
        notPlacedVertices.map(([key, { position }]) => [key, position])
      )
    });
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
  ({ verticesRenderData }) => ({
    verticesRenderData
  })
);

import { Vector } from '@shopify/react-native-skia';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';
import { GraphAnimationsSettingsWithDefaults } from '@/types/settings/graph/animations';
import { animateVerticesToFinalPositions } from '@/utils/animations';

export type PlacementLayoutContextType = {
  setTargetVerticesPositions: (positions: Record<string, Vector>) => void;
  setAnimatedVerticesPositions: (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => void;
};

const GraphPlacementLayoutContext = createContext<PlacementLayoutContextType>({
  setTargetVerticesPositions: () => undefined,
  setAnimatedVerticesPositions: () => undefined
});

export const useGraphPlacementLayoutContext = () => {
  const context = useContext(GraphPlacementLayoutContext);

  if (!context) {
    return null;
  }

  return context;
};

type GraphPlacementLayoutProviderProps = PropsWithChildren<{
  animationsSettings: GraphAnimationsSettingsWithDefaults;
}>;

export default function GraphPlacementLayoutProvider({
  animationsSettings,
  children
}: GraphPlacementLayoutProviderProps) {
  const [animatedVerticesPositions, setAnimatedVerticesPositions] = useState<
    Record<string, AnimatedVectorCoordinates>
  >({});
  const [targetVerticesPositions, setTargetVerticesPositions] = useState<
    Record<string, Vector>
  >({});

  const value = {
    setTargetVerticesPositions,
    setAnimatedVerticesPositions
  };

  useAnimatedReaction(
    () => ({}),
    () => {
      console.log('here');
      animateVerticesToFinalPositions(
        animatedVerticesPositions,
        targetVerticesPositions,
        animationsSettings.layout // TODO - add a possibility to change the animation settings
      );
    },
    [animatedVerticesPositions, targetVerticesPositions]
  );

  return (
    <GraphPlacementLayoutContext.Provider value={value}>
      {children}
    </GraphPlacementLayoutContext.Provider>
  );
}

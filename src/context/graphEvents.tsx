import { PropsWithChildren, createContext, useContext, useRef } from 'react';

import { Vector } from '@shopify/react-native-skia';

import { Vertex } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';

type GraphEventsContextType = {
  setAnimatedVerticesPositions: (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => void;
  handlePress: (position: Vector) => void;
  handleLongPress: (position: Vector) => void;
};

const GraphEventsContext = createContext<GraphEventsContextType>({
  setAnimatedVerticesPositions: () => undefined,
  handlePress: () => undefined,
  handleLongPress: () => undefined
});

export const useGraphEventsContext = () => {
  const context = useContext(GraphEventsContext);

  if (!context) {
    return null;
  }

  return context;
};

type GraphEventsProviderProps<V, E> = PropsWithChildren<{
  onVertexPress?: (vertex: Vertex<V, E>) => void;
  onVertexLongPress?: (vertex: Vertex<V, E>) => void;
}>;

export default function GraphEventsProvider<V, E>({
  children,
  ...eventHandlers
}: GraphEventsProviderProps<V, E>) {
  const animatedVerticesPositionsRef = useRef<
    Record<string, AnimatedVectorCoordinates>
  >({});

  const setAnimatedVerticesPositions = (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => {
    console.log('setAnimatedVerticesPositions');
    animatedVerticesPositionsRef.current = positions;
  };

  const handlePress = (position: Vector) => {
    // TODO - implement
    console.log(
      'handle press',
      Object.keys(animatedVerticesPositionsRef.current)
    );
  };

  const handleLongPress = (position: Vector) => {
    // TODO - implement
  };

  const contextValue: GraphEventsContextType = {
    setAnimatedVerticesPositions,
    handlePress,
    handleLongPress
  };

  return (
    <GraphEventsContext.Provider value={contextValue}>
      {children}
    </GraphEventsContext.Provider>
  );
}

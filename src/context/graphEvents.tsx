import { PropsWithChildren, createContext, useContext, useRef } from 'react';

import { Vector } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { GraphSettings } from '@/types/settings';
import { findPressedVertex } from '@/utils/graphs/layout';

type GraphEventsContextType<V, E> = {
  setAnimatedVerticesPositions: (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => void;
  setGraphSettings: (settings: GraphSettings<V, E>) => void;
  handlePress: (position: Vector) => void;
  handleLongPress: (position: Vector) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GraphEventsContext = createContext<GraphEventsContextType<any, any>>({
  setAnimatedVerticesPositions: () => undefined,
  setGraphSettings: () => undefined,
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

type GraphEventsProviderProps = PropsWithChildren<{
  onVertexPress?: (vertexKey: string) => void;
  onVertexLongPress?: (vertexKey: string) => void;
}>;

export default function GraphEventsProvider<V, E>({
  children,
  ...eventHandlers
}: GraphEventsProviderProps) {
  const animatedVerticesPositionsRef = useRef<
    Record<string, AnimatedVectorCoordinates>
  >({});
  const graphSettingsRef = useRef<GraphSettings<V, E>>({});

  const setAnimatedVerticesPositions = (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => {
    animatedVerticesPositionsRef.current = positions;
  };

  const setGraphSettings = (settings: GraphSettings<V, E>) => {
    graphSettingsRef.current = settings;
  };

  const handlePressHelper = (
    position: Vector,
    handlers: { onVertex?: (vertex: string) => void }
  ) => {
    if (handlers.onVertex) {
      const vertexKey = findPressedVertex(
        position,
        graphSettingsRef.current.components?.vertex?.radius ||
          VERTEX_COMPONENT_SETTINGS.radius,
        animatedVerticesPositionsRef.current
      );
      if (vertexKey) {
        handlers.onVertex(vertexKey);
      }
    }
  };

  const handlePress = (position: Vector) =>
    handlePressHelper(position, {
      onVertex: eventHandlers.onVertexPress
    });

  const handleLongPress = (position: Vector) => {
    return handlePressHelper(position, {
      onVertex: eventHandlers.onVertexLongPress
    });
  };

  const contextValue: GraphEventsContextType<V, E> = {
    setAnimatedVerticesPositions,
    setGraphSettings,
    handlePress,
    handleLongPress
  };

  return (
    <GraphEventsContext.Provider value={contextValue}>
      {children}
    </GraphEventsContext.Provider>
  );
}

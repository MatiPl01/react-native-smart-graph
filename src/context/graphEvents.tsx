import { PropsWithChildren, createContext, useContext, useRef } from 'react';

import { Vector } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { GraphSettings } from '@/types/settings';
import { findPressedEdge, findPressedVertex } from '@/utils/graphs/layout';

type GraphEventsContextType<V, E> = {
  setAnimatedVerticesPositions: (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => void;
  setGraphSettings: (settings: GraphSettings<V, E>) => void;
  setGraphModel: (graph: Graph<V, E>) => void;
  handlePress: (position: Vector) => void;
  handleLongPress: (position: Vector) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GraphEventsContext = createContext<GraphEventsContextType<any, any>>({
  setAnimatedVerticesPositions: () => undefined,
  setGraphSettings: () => undefined,
  setGraphModel: () => undefined,
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
  edgePressDistance?: number;
  onVertexPress?: (vertexKey: string) => void;
  onVertexLongPress?: (vertexKey: string) => void;
  onEdgePress?: (edgeKey: string) => void;
  onEdgeLongPress?: (edgeKey: string) => void;
}>;

export default function GraphEventsProvider<V, E>({
  children,
  edgePressDistance = 10,
  ...eventHandlers
}: GraphEventsProviderProps) {
  const animatedVerticesPositionsRef = useRef<
    Record<string, AnimatedVectorCoordinates>
  >({});
  const graphSettingsRef = useRef<GraphSettings<V, E>>({});
  const graphModelRef = useRef<Graph<V, E> | null>(null);

  const setAnimatedVerticesPositions = (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => {
    animatedVerticesPositionsRef.current = positions;
  };

  const setGraphSettings = (settings: GraphSettings<V, E>) => {
    graphSettingsRef.current = settings;
  };

  const setGraphModel = (graph: Graph<V, E>) => {
    graphModelRef.current = graph;
  };

  const handlePressHelper = (
    position: Vector,
    pressHandlers: {
      vertex?: (vertex: string) => void;
      edge?: (edge: string) => void;
    }
  ) => {
    if (pressHandlers.vertex) {
      const vertexKey = findPressedVertex(
        position,
        graphSettingsRef.current.components?.vertex?.radius ||
          VERTEX_COMPONENT_SETTINGS.radius,
        animatedVerticesPositionsRef.current
      );
      if (vertexKey) {
        pressHandlers.vertex(vertexKey);
        return;
      }
    }

    if (graphModelRef.current && pressHandlers.edge) {
      const edgeKey = findPressedEdge(
        position,
        graphModelRef.current,
        edgePressDistance,
        animatedVerticesPositionsRef.current
      );
      if (edgeKey) {
        pressHandlers.edge(edgeKey);
      }
    }
  };

  const handlePress = (position: Vector) =>
    handlePressHelper(position, {
      vertex: eventHandlers.onVertexPress,
      edge: eventHandlers.onEdgePress
    });

  const handleLongPress = (position: Vector) => {
    return handlePressHelper(position, {
      vertex: eventHandlers.onVertexLongPress,
      edge: eventHandlers.onEdgeLongPress
    });
  };

  const contextValue: GraphEventsContextType<V, E> = {
    setAnimatedVerticesPositions,
    setGraphSettings,
    setGraphModel,
    handlePress,
    handleLongPress
  };

  return (
    <GraphEventsContext.Provider value={contextValue}>
      {children}
    </GraphEventsContext.Provider>
  );
}

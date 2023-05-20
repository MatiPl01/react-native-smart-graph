import { PropsWithChildren, createContext, useContext, useRef } from 'react';

import { Vector } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { EDGE_HIT_SLOP, VERTEX_HIT_SLOP } from '@/constants/events';
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

type PressHandler = (data: { key: string; position: Vector }) => void;

type GraphEventsProviderProps = PropsWithChildren<{
  edgeHitSlop?: number;
  vertexHitSlop?: number;
  onVertexPress?: PressHandler;
  onVertexLongPress?: PressHandler;
  onEdgePress?: PressHandler;
  onEdgeLongPress?: PressHandler;
}>;

export default function GraphEventsProvider<V, E>({
  children,
  edgeHitSlop = EDGE_HIT_SLOP,
  vertexHitSlop = VERTEX_HIT_SLOP,
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
      vertex?: PressHandler;
      edge?: PressHandler;
    }
  ) => {
    if (pressHandlers.vertex) {
      const vertexKey = findPressedVertex(
        position,
        graphSettingsRef.current.components?.vertex?.radius ||
          VERTEX_COMPONENT_SETTINGS.radius,
        vertexHitSlop,
        animatedVerticesPositionsRef.current
      );
      if (vertexKey) {
        pressHandlers.vertex({ key: vertexKey, position });
        return;
      }
    }

    if (graphModelRef.current && pressHandlers.edge) {
      const edgeKey = findPressedEdge(
        position,
        graphModelRef.current,
        edgeHitSlop,
        animatedVerticesPositionsRef.current
      );
      if (edgeKey) {
        pressHandlers.edge({ key: edgeKey, position });
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

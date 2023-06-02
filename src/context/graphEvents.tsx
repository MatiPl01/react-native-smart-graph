import { Vector } from '@shopify/react-native-skia';
import { createContext, PropsWithChildren, useContext, useRef } from 'react';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { EDGE_LABEL_HIT_SLOP, VERTEX_HIT_SLOP } from '@/constants/events';
import { Graph } from '@/types/graphs';
import { AnimatedVector, AnimatedVectorCoordinates } from '@/types/layout';
import { GraphSettings } from '@/types/settings';
import { findPressedEdgeLabel, findPressedVertex } from '@/utils/graphs/layout';

export type GraphEventsContextType<V, E> = {
  setAnimatedEdgeLabelsPositions: (
    positions: Record<string, AnimatedVector>
  ) => void;
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
  setAnimatedEdgeLabelsPositions: () => undefined,
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
  edgeLabelHitSlop?: number;
  vertexHitSlop?: number;
  onVertexPress?: PressHandler;
  onVertexLongPress?: PressHandler;
  onEdgePress?: PressHandler;
  onEdgeLongPress?: PressHandler;
}>;

export default function GraphEventsProvider<V, E>({
  children,
  edgeLabelHitSlop = EDGE_LABEL_HIT_SLOP,
  vertexHitSlop = VERTEX_HIT_SLOP,
  ...eventHandlers
}: GraphEventsProviderProps) {
  const animatedVerticesPositionsRef = useRef<
    Record<string, AnimatedVectorCoordinates>
  >({});
  const animatedEdgeLabelsPositionsRef = useRef<Record<string, AnimatedVector>>(
    {}
  );
  const graphSettingsRef = useRef<GraphSettings<V, E>>({});
  const graphModelRef = useRef<Graph<V, E> | null>(null);

  const setAnimatedVerticesPositions = (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => {
    animatedVerticesPositionsRef.current = positions;
  };

  const setAnimatedEdgeLabelsPositions = (
    positions: Record<string, AnimatedVector>
  ) => {
    animatedEdgeLabelsPositionsRef.current = positions;
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
      const edgeKey = findPressedEdgeLabel(
        position,
        graphModelRef.current,
        edgeLabelHitSlop,
        animatedEdgeLabelsPositionsRef.current
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
    setAnimatedEdgeLabelsPositions,
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

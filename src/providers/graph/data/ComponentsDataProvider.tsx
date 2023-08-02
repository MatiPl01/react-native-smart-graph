/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Context,
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { useGraphObserver } from '@/hooks';
import {
  EdgeComponentData,
  EdgeRemoveHandler,
  VertexComponentData,
  VertexRemoveHandler
} from '@/types/components';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';
import { DataProviderReturnType } from '@/types/data';
import { Graph, GraphConnections } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import { GraphRenderersWithDefaults } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  GraphSettingsWithDefaults
} from '@/types/settings';
import {
  updateGraphEdgeLabelsData,
  updateGraphEdgesData,
  updateGraphVerticesData
} from '@/utils/components';
import { withMemoContext } from '@/utils/contexts';
import { cancelEdgeAnimations, cancelVertexAnimations } from '@/utils/data';

export type ComponentsDataContextType<V, E> = {
  connections: GraphConnections;
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  edgesData: Record<string, EdgeComponentData<E, V>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  renderers: GraphRenderersWithDefaults<V, E>;
  settings: GraphSettingsWithDefaults<V>;
  targetBoundingRect: SharedValue<BoundingRect>;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

const ComponentsDataContext = createContext(null as unknown as object);

type ComponentsDataProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  renderers: GraphRenderersWithDefaults<V, E>;
  settings: GraphSettingsWithDefaults<V>;
}>;

export default function ComponentsDataProvider<V, E>({
  children,
  graph,
  renderers,
  settings
}: ComponentsDataProviderProps<V, E>) {
  // GRAPH CHANGES OBSERVER
  const [{ animationsSettings, orderedEdges, vertices }] =
    useGraphObserver(graph);

  // GRAPH COMPONENTS DATA
  // VERTICES
  // Store data for graph vertex components
  const [verticesData, setVerticesData] = useState<
    Record<string, VertexComponentData<V, E>>
  >({});
  // Store keys of removed vertices for thich the removal animation
  // has been completed and vertices are waiting to be unmounted
  const removedVertices = useMemo(() => new Set<string>(), []);

  // EDGES
  // Store data for graph edge components
  const [edgesData, setEdgesData] = useState<
    Record<string, EdgeComponentData<E, V>>
  >({});
  // Store keys of removed edges for thich the removal animation
  // has been completed and edges are waiting to be unmounted
  const removedEdges = useMemo(() => new Set<string>(), []);

  // EDGE LABELS
  // Store data for edge labels
  const [edgeLabelsData, setEdgeLabelsData] = useState<
    Record<string, EdgeLabelComponentData<E>>
  >({});

  // ANIMATION SETTINGS
  // Graph layout animation settings
  // (animation settings related to vertices and edges are stored
  // in their respective data objects)
  const layoutAnimationSettings = useMemo<AnimationSettingsWithDefaults>(
    () =>
      ({
        ...settings.animations.layout,
        ...animationsSettings.layout
      } as unknown as AnimationSettingsWithDefaults),
    [animationsSettings, settings.animations.layout]
  );

  // GRAPH CONNECTIONS
  // Graph connections (used to pass information about graph to
  // worklets which are not able to access graph object directly)
  const connections = useMemo<GraphConnections>(
    () => graph.connections,
    [vertices, orderedEdges]
  );

  // VALUES UPDATED BY OTHER PROVIDERS
  // Target bounding rect
  const targetBoundingRect = useSharedValue<BoundingRect>({
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  });

  useEffect(() => {
    const { data, shouldRender } = updateGraphVerticesData(
      verticesData,
      vertices,
      removedVertices,
      animationsSettings.vertices,
      settings.animations.vertices
    );
    if (shouldRender) {
      setVerticesData(data);
    }

    return () => {
      for (const vertexData of Object.values(data)) {
        cancelVertexAnimations(vertexData);
      }
    };
  }, [vertices]);

  useEffect(() => {
    const { data, shouldRender } = updateGraphEdgesData(
      edgesData,
      orderedEdges,
      verticesData,
      removedEdges,
      animationsSettings.edges,
      settings.animations.edges
    );
    if (shouldRender) {
      setEdgesData(data);
    }

    return () => {
      for (const edgeData of Object.values(data)) {
        cancelEdgeAnimations(edgeData);
      }
    };
  }, [orderedEdges, verticesData]);

  useEffect(() => {
    if (!renderers.label) {
      // Remove labels if there is no label renderer
      if (Object.keys(edgeLabelsData).length > 0) {
        setEdgeLabelsData({});
      }
      return;
    }
    const { data, shouldRender } = updateGraphEdgeLabelsData(
      edgeLabelsData,
      edgesData
    );
    if (shouldRender) {
      setEdgeLabelsData(data);
    }
  }, [edgesData, renderers.label]);

  const handleVertexRemove = useCallback<VertexRemoveHandler>(key => {
    const vertexData = verticesData[key];
    if (!vertexData) return;
    cancelVertexAnimations(vertexData);
    removedVertices.add(key);
  }, []);

  const handleEdgeRemove = useCallback<EdgeRemoveHandler>(key => {
    const edgeData = edgesData[key];
    if (!edgeData) return;
    cancelEdgeAnimations(edgeData);
    removedEdges.add(key);
  }, []);

  const contextValue = useMemo<ComponentsDataContextType<V, E>>(
    () => ({
      connections,
      edgeLabelsData,
      edgesData,
      handleEdgeRemove,
      handleVertexRemove,
      layoutAnimationSettings,
      renderers,
      settings,
      targetBoundingRect,
      verticesData
    }),
    [
      connections,
      verticesData,
      edgesData,
      layoutAnimationSettings,
      edgeLabelsData,
      settings,
      renderers
    ]
  );

  return (
    <ComponentsDataContext.Provider value={contextValue}>
      {children}
    </ComponentsDataContext.Provider>
  );
}

export const withGraphData = <
  C extends ComponentsDataContextType<unknown, unknown>, // context type
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: C) => R
) =>
  withMemoContext(
    Component,
    ComponentsDataContext as unknown as Context<C>,
    selector
  ) as DataProviderReturnType<P, R>;

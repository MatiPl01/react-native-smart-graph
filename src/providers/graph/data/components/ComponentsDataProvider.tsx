import {
  Context,
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

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
import {
  AnimationSettingsWithDefaults,
  GraphAnimationsSettingsWithDefaults
} from '@/types/settings';
import {
  cancelEdgeAnimations,
  cancelVertexAnimations
} from '@/utils/animations';
import {
  updateGraphEdgeLabelsData,
  updateGraphEdgesData,
  updateGraphVerticesData
} from '@/utils/components';
import { withMemoContext } from '@/utils/contexts';
import { withGraphData } from '../context';

export type ComponentsDataContextType<V, E> = {
  connections: GraphConnections;
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  edgesData: Record<string, EdgeComponentData<E, V>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

const ComponentsDataContext = createContext(null as unknown as object);

export const withComponentsData = <
  C extends ComponentsDataContextType<unknown, unknown>, // context type
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: C) => R
) => Component; // TODO - this is temporary
// withMemoContext(
//   Component,
//   ComponentsDataContext as unknown as Context<C>,
//   selector
// ) as DataProviderReturnType<P, R>;

type ComponentsDataProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  graphAnimationsSettings: GraphAnimationsSettingsWithDefaults;
  renderLabels: boolean;
}>;

function ComponentsDataProvider<V, E>({
  children,
  graph,
  graphAnimationsSettings,
  renderLabels
}: ComponentsDataProviderProps<V, E>) {
  console.log('ComponentsDataProvider');
  return <>{children}</>;
  // GRAPH CHANGES OBSERVER
  const [data] = useGraphObserver(graph);

  // GRAPH COMPONENTS DATA
  // VERTICES
  // Store data for graph vertex components
  const [verticesData, setVerticesData] = useState<
    Record<string, VertexComponentData<V, E>>
  >({});
  // Store keys of removed vertices for which the removal animation
  // has been completed and vertices are waiting to be unmounted
  const removedVertices = useMemo(() => new Set<string>(), []);

  // EDGES
  // Store data for graph edge components
  const [edgesData, setEdgesData] = useState<
    Record<string, EdgeComponentData<E, V>>
  >({});
  // Store keys of removed edges for which the removal animation
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
    () => ({
      ...graphAnimationsSettings.layout,
      ...data.animationsSettings.layout
    }),
    [data, graphAnimationsSettings.layout]
  );

  // GRAPH CONNECTIONS
  // Graph connections (used to pass information about graph to
  // worklets which are not able to access graph object directly)
  const connections = useMemo<GraphConnections>(
    () => graph.connections,
    [data]
  );

  useEffect(() => {
    const { data: updatedData, shouldRender } = updateGraphVerticesData(
      verticesData,
      data.vertices,
      removedVertices,
      data.animationsSettings.vertices,
      graphAnimationsSettings.vertices
    );
    if (shouldRender) {
      setVerticesData(updatedData);
    }

    return () => {
      for (const vertexData of Object.values(updatedData)) {
        cancelVertexAnimations(vertexData);
      }
    };
  }, [data]);

  useEffect(() => {
    const { data: updatedData, shouldRender } = updateGraphEdgesData(
      edgesData,
      data.orderedEdges,
      verticesData,
      removedEdges,
      data.animationsSettings.edges,
      graphAnimationsSettings.edges
    );
    if (shouldRender) {
      setEdgesData(updatedData);
    }

    return () => {
      for (const edgeData of Object.values(updatedData)) {
        cancelEdgeAnimations(edgeData);
      }
    };
  }, [data, verticesData]);

  useEffect(() => {
    if (!renderLabels) {
      // Remove labels if there is no label renderer
      if (Object.keys(edgeLabelsData).length > 0) {
        setEdgeLabelsData({});
      }
      return;
    }
    const { data: updatedData, shouldRender } = updateGraphEdgeLabelsData(
      edgeLabelsData,
      edgesData
    );
    if (shouldRender) {
      setEdgeLabelsData(updatedData);
    }
  }, [edgesData, renderLabels]);

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
      verticesData
    }),
    [
      connections,
      verticesData,
      edgesData,
      layoutAnimationSettings,
      edgeLabelsData
    ]
  );

  return (
    <ComponentsDataContext.Provider value={contextValue}>
      {children}
    </ComponentsDataContext.Provider>
  );
}

export default withGraphData(
  ComponentsDataProvider,
  ({ graph, settings, renderers }) => ({
    graph,
    graphAnimationsSettings: settings.animations,
    renderLabels: !!renderers.label
  })
);

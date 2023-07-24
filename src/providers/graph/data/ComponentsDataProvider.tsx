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
  EdgeComponentRenderData,
  EdgeRemoveHandler,
  EdgeRenderHandler,
  VertexComponentData,
  VertexComponentRenderData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';
import { Graph, GraphConnections } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import { GraphRenderersWithDefaults } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { CommonTypes } from '@/types/utils';
import {
  updateGraphEdgeLabelsData,
  updateGraphEdgesData,
  updateGraphVerticesData
} from '@/utils/components';
import { withMemoContext } from '@/utils/contexts';

export type ComponentsDataContextType<V, E> = {
  connections: GraphConnections;
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  edgesData: Record<string, EdgeComponentData<E, V>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
  handleVertexRemove: VertexRemoveHandler;
  handleVertexRender: VertexRenderHandler;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  renderedEdgesData: Record<string, EdgeComponentRenderData>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
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

  // GRAPH COMPONENTS DATA (necessary to render graph components)
  // (This data is managed by contexts)
  // Store data for graph vertex components
  const [verticesData, setVerticesData] = useState<
    Record<string, VertexComponentData<V, E>>
  >({});
  // Store data for graph edge components
  const [edgesData, setEdgesData] = useState<
    Record<string, EdgeComponentData<E, V>>
  >({});
  // Store data for edge labels
  const [edgeLabelsData, setEdgeLabelsData] = useState<
    Record<string, EdgeLabelComponentData<E>>
  >({});

  // GRAPH COMPONENTS RENDER DATA (received from graph components
  // after they have been rendered)
  // (This data is managed by rendered components)
  // Store render data for graph vertex components
  const [renderedVerticesData, setRenderedVerticesData] = useState<
    Record<string, VertexComponentRenderData>
  >({});
  // Store render data for graph edge components
  const [renderedEdgesData, setRenderedEdgesData] = useState<
    Record<string, EdgeComponentRenderData>
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
    const { data, wasUpdated } = updateGraphVerticesData(
      verticesData,
      vertices,
      animationsSettings,
      settings,
      renderers
    );
    if (wasUpdated) {
      setVerticesData(data);
    }
  }, [
    vertices,
    settings.components.vertex,
    settings.animations.vertices,
    renderers.vertex
  ]);

  useEffect(() => {
    const { data, wasUpdated } = updateGraphEdgesData(
      edgesData,
      orderedEdges,
      renderedVerticesData,
      animationsSettings,
      settings,
      renderers
    );
    if (wasUpdated) {
      setEdgesData(data);
    }
  }, [
    orderedEdges,
    renderedVerticesData,
    settings.components.edge,
    settings.animations.edges,
    renderers.edge,
    renderers.arrow
  ]);

  useEffect(() => {
    if (!renderers.label) {
      // Remove labels if there is no label renderer
      if (Object.keys(edgeLabelsData).length > 0) {
        setEdgeLabelsData({});
      }
      return;
    }
    const { data, wasUpdated } = updateGraphEdgeLabelsData(
      edgeLabelsData,
      edgesData,
      renderedEdgesData,
      renderers.label
    );
    if (wasUpdated) {
      setEdgeLabelsData(data);
    }
  }, [renderedEdgesData, renderers.label]);

  const handleVertexRender = useCallback<VertexRenderHandler>(
    (key, renderValues) => {
      setRenderedVerticesData(prev => ({ ...prev, [key]: renderValues }));
    },
    []
  );

  const handleVertexRemove = useCallback<VertexRemoveHandler>(key => {
    setVerticesData(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setRenderedVerticesData(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleEdgeRender = useCallback<EdgeRenderHandler>(
    (key, renderValues) => {
      setRenderedEdgesData(prev => ({ ...prev, [key]: renderValues }));
    },
    []
  );

  const handleEdgeRemove = useCallback<EdgeRemoveHandler>(key => {
    setEdgesData(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setRenderedEdgesData(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const contextValue = useMemo<ComponentsDataContextType<V, E>>(
    () => ({
      connections,
      edgeLabelsData,
      edgesData,
      handleEdgeRemove,
      handleEdgeRender,
      handleVertexRemove,
      handleVertexRender,
      layoutAnimationSettings,
      renderedEdgesData,
      renderedVerticesData,
      targetBoundingRect,
      verticesData
    }),
    [
      connections,
      verticesData,
      edgesData,
      renderedVerticesData,
      renderedEdgesData,
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

export const withGraphData = <
  P extends object,
  V extends CommonTypes<ComponentsDataContextType<unknown, unknown>, P>
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: V) => Partial<V>
) =>
  withMemoContext(
    Component,
    ComponentsDataContext as unknown as Context<
      ComponentsDataContextType<unknown, unknown>
    >,
    selector
  ) as <
    C extends object = P // This workaround allows passing generic prop types
  >(
    props: Omit<C, keyof V>
  ) => JSX.Element;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unused-modules */
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
  EdgeComponentRenderData,
  EdgeRemoveHandler,
  EdgeRenderHandler,
  VertexComponentData,
  VertexComponentRenderData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { Graph, GraphConnections } from '@/types/graphs';
import { GraphRenderersWithDefaults } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { CommonTypes } from '@/types/utils';
import {
  updateGraphEdgesData,
  updateGraphVerticesData
} from '@/utils/components';
import { withMemoContext } from '@/utils/contexts';

export type ComponentsDataContextType<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  connections: GraphConnections;
  edgesData: Record<string, EdgeComponentData<E, V, ED>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
  handleVertexRemove: VertexRemoveHandler;
  handleVertexRender: VertexRenderHandler;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  renderedEdgesData: Record<string, EdgeComponentRenderData>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

// The initial value must be falsy to ensure that the context is
// not used outside of a provider
const ComponentsDataContext = createContext(null);

type ComponentsDataProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<{
  graph: Graph<V, E>;
  renderers: GraphRenderersWithDefaults<V, E>;
  settings: GraphSettingsWithDefaults<V, E, ED>;
}>;

export default function ComponentsDataProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  children,
  graph,
  renderers,
  settings
}: ComponentsDataProviderProps<V, E, ED>) {
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
    Record<string, EdgeComponentData<E, V, ED>>
  >({});

  // GRAPH COMPONENTS RENDER DATA (received from graph components
  // after they have been rendered)
  //(This data is managed by rendered components)
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
    () => ({
      ...settings.animations.layout,
      ...animationsSettings.layout
    }),
    [animationsSettings, settings.animations.layout]
  );

  // GRAPH CONNECTIONS
  // Graph connections (used to pass information about graph to
  // worklets which are not able to access graph object directly)
  const connections = useMemo<GraphConnections>(
    () => graph.connections,
    [vertices, orderedEdges]
  );

  useEffect(() => {
    setVerticesData(
      updateGraphVerticesData(
        verticesData,
        vertices,
        animationsSettings,
        settings,
        renderers
      )
    );
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
    renderers.label,
    renderers.arrow
  ]);

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

  const contextValue = useMemo<ComponentsDataContextType<V, E, ED>>(
    () => ({
      connections,
      edgesData,
      handleEdgeRemove,
      handleEdgeRender,
      handleVertexRemove,
      handleVertexRender,
      layoutAnimationSettings,
      renderedEdgesData,
      renderedVerticesData,
      verticesData
    }),
    [
      connections,
      verticesData,
      edgesData,
      renderedVerticesData,
      renderedEdgesData,
      layoutAnimationSettings
    ]
  );

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */}
      <ComponentsDataContext.Provider value={contextValue as any}>
        {children}
      </ComponentsDataContext.Provider>
    </>
  );
}

export const withGraphData = <
  P extends object,
  V extends CommonTypes<ComponentsDataContextType<unknown, unknown, never>, P>
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: V) => Partial<V>
) =>
  withMemoContext(
    Component,
    ComponentsDataContext as unknown as Context<
      ComponentsDataContextType<unknown, unknown, never>
    >,
    selector
  ) as <
    C extends object = P // This workaround allows passing generic prop types
  >(
    props: Omit<C, keyof V>
  ) => JSX.Element;

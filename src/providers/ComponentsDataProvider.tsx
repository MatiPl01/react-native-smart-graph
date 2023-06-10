/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unused-modules */
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
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
import { Graph } from '@/types/graphs';
import { GraphRenderersWithDefaults } from '@/types/renderer';
import {
  AnimationSettingsWithDefaults,
  GraphSettingsWithDefaults
} from '@/types/settings';
import {
  updateGraphEdgesData,
  updateGraphVerticesData
} from '@/utils/components';

type ComponentsDataContextType<V, E> = {
  verticesData: Record<string, VertexComponentData<V, E>>;
  edgesData: Record<string, EdgeComponentData<E, V>>;
  verticesRenderData: Record<string, VertexComponentRenderData>;
  edgesRenderData: Record<string, EdgeComponentRenderData>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  handleVertexRender: VertexRenderHandler;
  handleVertexRemove: VertexRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
  handleEdgeRemove: EdgeRemoveHandler;
};

const ComponentsDataContext = createContext({});

export const useComponentsDataContext = <V, E>(): ComponentsDataContextType<
  V,
  E
> => {
  const context = useContext(ComponentsDataContext);

  if (!context) {
    throw new Error(
      'useComponentsDataContext must be used within a ComponentsDataProvider'
    );
  }

  return context as ComponentsDataContextType<V, E>;
};

type ComponentsDataProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  settings: GraphSettingsWithDefaults<V, E>;
  renderers: GraphRenderersWithDefaults<V, E>;
}>;

export default function ComponentsDataProvider<V, E>({
  graph,
  settings,
  renderers,
  children
}: ComponentsDataProviderProps<V, E>) {
  // GRAPH CHANGES OBSERVER
  const [{ vertices, orderedEdges, animationsSettings }] =
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

  // GRAPH COMPONENTS RENDER DATA (received from graph components
  // after they have been rendered)
  //(This data is managed by rendered components)
  // Store render data for graph vertex components
  const [verticesRenderData, setVerticesRenderData] = useState<
    Record<string, VertexComponentRenderData>
  >({});
  // Store render data for graph edge components
  const [edgesRenderData, setEdgesRenderData] = useState<
    Record<string, EdgeComponentRenderData>
  >({});

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
  }, [vertices]);

  useEffect(() => {
    setEdgesData(
      updateGraphEdgesData(
        edgesData,
        orderedEdges,
        animationsSettings,
        settings,
        renderers
      )
    );
  }, [orderedEdges]);

  const layoutAnimationSettings = useMemo<AnimationSettingsWithDefaults>(
    () => ({
      ...settings.animations.layout,
      ...animationsSettings.layout
    }),
    [animationsSettings, settings.animations.layout]
  );

  const handleVertexRender = useCallback<VertexRenderHandler>(
    (key, renderValues) => {
      setVerticesRenderData(prev => ({ ...prev, [key]: renderValues }));
    },
    []
  );

  const handleVertexRemove = useCallback<VertexRemoveHandler>(key => {
    setVerticesData(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setVerticesRenderData(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleEdgeRender = useCallback<EdgeRenderHandler>(
    (key, renderValues) => {
      setEdgesRenderData(prev => ({ ...prev, [key]: renderValues }));
    },
    []
  );

  const handleEdgeRemove = useCallback<EdgeRemoveHandler>(key => {
    setEdgesData(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setEdgesRenderData(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const contextValue = useMemo<ComponentsDataContextType<V, E>>(
    () => ({
      verticesData,
      edgesData,
      verticesRenderData,
      edgesRenderData,
      layoutAnimationSettings,
      handleVertexRender,
      handleEdgeRender,
      handleVertexRemove,
      handleEdgeRemove
    }),
    [verticesData, edgesData, verticesRenderData, edgesRenderData]
  );

  return (
    <>
      <ComponentsDataContext.Provider value={contextValue}>
        {children}
      </ComponentsDataContext.Provider>
    </>
  );
}

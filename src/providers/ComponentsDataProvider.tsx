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
import { Graph } from '@/types/graphs';
import { GraphRenderersWithDefaults } from '@/types/renderer';
import { GraphSettingsWithDefaults } from '@/types/settings';
import { CommonTypes } from '@/types/utils';
import {
  updateGraphEdgesData,
  updateGraphVerticesData
} from '@/utils/components';
import { withMemoContext } from '@/utils/contexts';

export type ComponentsDataContextType<V, E> = {
  verticesData: Record<string, VertexComponentData<V, E>>;
  edgesData: Record<string, EdgeComponentData<E, V>>;
  verticesRenderData: Record<string, VertexComponentRenderData>;
  edgesRenderData: Record<string, EdgeComponentRenderData>;
  handleVertexRender: VertexRenderHandler;
  handleVertexRemove: VertexRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
  handleEdgeRemove: EdgeRemoveHandler;
};

const ComponentsDataContext = createContext({});

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
        verticesRenderData,
        animationsSettings,
        settings,
        renderers
      )
    );
  }, [orderedEdges, verticesRenderData]);

  const handleVertexRender = useCallback<VertexRenderHandler>(
    (key, renderValues) => {
      setVerticesRenderData(prev => {
        prev[key] = renderValues;
        return { ...prev };
      });
    },
    []
  );

  const handleVertexRemove = useCallback<VertexRemoveHandler>(key => {
    setVerticesData(prev => {
      delete prev[key];
      return { ...prev };
    });
    setVerticesRenderData(prev => {
      delete prev[key];
      return { ...prev };
    });
  }, []);

  const handleEdgeRender = useCallback<EdgeRenderHandler>(
    (key, renderValues) => {
      setEdgesRenderData(prev => {
        prev[key] = renderValues;
        return { ...prev };
      });
    },
    []
  );

  const handleEdgeRemove = useCallback<EdgeRemoveHandler>(key => {
    setEdgesData(prev => {
      delete prev[key];
      return { ...prev };
    });
    setEdgesRenderData(prev => {
      delete prev[key];
      return { ...prev };
    });
  }, []);

  const contextValue = useMemo<ComponentsDataContextType<V, E>>(
    () => ({
      verticesData,
      edgesData,
      verticesRenderData,
      edgesRenderData,
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
    C extends object // This workaround allows passing generic prop types
  >(
    props: Omit<C, keyof V>
  ) => JSX.Element;

import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import {
  EdgeComponentData,
  EdgeRemoveHandler,
  EdgeRenderHandler,
  VertexComponentData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';
import { Graph } from '@/types/graphs';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings } from '@/types/settings';
import {
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults
} from '@/utils/components';

import ComponentsDataProvider from './ComponentsDataContext';
import ContextProviderComposer from './utils/ContextProviderComposer';

export type GraphContextType<V, E> = {
  vertices: Record<string, VertexComponentData<V, E>>;
  edges: Record<string, EdgeComponentData<E, V>>;
  handleVertexRender: VertexRenderHandler;
  handleEdgeRender: EdgeRenderHandler;
  handleVertexRemove: VertexRemoveHandler;
  handleEdgeRemove: EdgeRemoveHandler;
};

const GraphContext = createContext({});

export const useGraphContext = <V, E>(): GraphContextType<V, E> => {
  const context = useContext(GraphContext);

  if (!context) {
    throw new Error('useGraphContext must be used within a GraphProvider');
  }

  return context as GraphContextType<V, E>;
};

type GraphProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  settings?: GraphSettings<V, E>;
  renderers?: GraphRenderers<V, E>;
}>;

// eslint-disable-next-line import/no-unused-modules
export default function GraphProvider<V, E>({
  graph,
  settings,
  renderers,
  children
}: GraphProviderProps<V, E>) {
  const memoSettings = useMemo(
    () => updateGraphSettingsWithDefaults(graph.isDirected(), settings),
    [graph, settings]
  );

  const memoRenderers = useMemo(
    () =>
      updateGraphRenderersWithDefaults(
        graph.isDirected(),
        memoSettings.components.edge.type,
        renderers
      ),
    [graph, memoSettings, renderers]
  );

  const providers = useMemo(
    () => [
      <ComponentsDataProvider
        graph={graph}
        settings={memoSettings}
        renderers={memoRenderers}
      />
      // <GraphLayoutProvider
      //   graph={graph}
      //   layoutSettings={memoSettings.layout}
      //   animationsSettings={memoSettings.animations}
      // />
    ],
    [memoSettings]
  );

  return (
    <ContextProviderComposer providers={providers}>
      {children}
    </ContextProviderComposer>
  );
}

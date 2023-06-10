import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { useGraphObserver } from '@/hooks';
import {
  GraphEdgeData,
  GraphVertexData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';
import { Graph } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { GraphRenderers, GraphRenderersWithDefaults } from '@/types/renderer';
import { GraphSettings, GraphSettingsWithDefaults } from '@/types/settings';
import {
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults
} from '@/utils/components';

import GraphPlacementLayoutProvider, {
  useGraphPlacementLayoutContext
} from './layout/PlacementLayoutContext';
import ContextProviderComposer from './utils/ContextProviderComposer';

export type GraphContextType<V, E> = {
  vertices: Record<string, GraphVertexData<V, E>>;
  edges: Record<string, GraphEdgeData<E, V>>;
  handleVertexRender: VertexRenderHandler;
  handleEdgeRender: (
    key: string,
    labelPosition: AnimatedVectorCoordinates
  ) => void;
  handleVertexRemove: VertexRemoveHandler;
  handleEdgeRemove: (key: string) => void;
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
    [settings]
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
      <GraphPlacementLayoutProvider
        animationsSettings={memoSettings.animations}
      />
    ],
    [settings]
  );

  return (
    <ContextProviderComposer providers={providers}>
      <InnerGraphProvider
        graph={graph}
        settings={memoSettings}
        renderers={memoRenderers}>
        {children}
      </InnerGraphProvider>
    </ContextProviderComposer>
  );
}

type InnerGraphProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  settings: GraphSettingsWithDefaults<V, E>;
  renderers: GraphRenderersWithDefaults<V, E>;
}>;

function InnerGraphProvider<V, E>({
  children,
  ...data
}: InnerGraphProviderProps<V, E>) {
  // GRAPH OBSERVER
  const [graphData] = useGraphObserver(data.graph);
  // LAYOUT
  // Placement
  const placementSetters = useGraphPlacementLayoutContext();

  const value: GraphContextType<V, E> = useMemo(
    () => ({
      data,
      setters: placementSetters
    }),
    [data]
  );

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
}

import { memo, PropsWithChildren, useMemo } from 'react';

import {
  DirectedGraphComponentProps,
  UndirectedGraphComponentProps
} from '@/components/graphs';
import { ContextProviderComposer } from '@/providers/utils';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { Graph } from '@/types/graphs';
import { GraphSettingsWithDefaults } from '@/types/settings';
import {
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults
} from '@/utils/components';
import { deepMemoComparator } from '@/utils/equality';

import {
  CanvasContexts,
  CanvasContextsContext
} from './contexts/CanvasContextsProvider';
import { ComponentsDataProvider } from './data/components';
import { PressEventsProvider, PressEventsProviderProps } from './events';
import {
  ContainerDimensionsProvider,
  ForcesLayoutProvider,
  ForcesPlacementProvider,
  ForcesPlacementProviderProps,
  GraphPlacementLayoutProviderProps,
  PlacementLayoutProvider
} from './layout';
import { MultiStepVertexFocusProvider, VertexFocusProvider } from './transform';

const getLayoutProviders = <V, E>(
  graph: Graph<V, E>,
  settings: GraphSettingsWithDefaults<V>
) => {
  switch (settings.layout.managedBy) {
    case 'forces':
      return [
        <ForcesPlacementProvider<ForcesPlacementProviderProps<V, E>>
          graph={graph}
          settings={settings}
        />,
        <ForcesLayoutProvider forcesSettings={settings.layout.settings} />
      ];
    case 'placement':
    default:
      return [
        <PlacementLayoutProvider<GraphPlacementLayoutProviderProps<V, E>>
          graph={graph}
          settings={settings}
        />
      ];
  }
};

const getEventsProviders = <V, E>(
  transform: AnimatedCanvasTransform,
  settings: GraphSettingsWithDefaults<V>
) => {
  if (settings.events) {
    return [
      <PressEventsProvider<PressEventsProviderProps<V, E>>
        settings={settings.events}
        transform={transform}
      />
    ];
  }
  return [];
};

type GraphProviderProps<V, E> = PropsWithChildren<
  {
    canvasContexts: CanvasContexts;
  } & (DirectedGraphComponentProps<V, E> | UndirectedGraphComponentProps<V, E>)
>;

function GraphProvider<V, E>({
  canvasContexts,
  children,
  graph,
  renderers,
  settings
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

  const transform = useMemo(
    () => ({
      scale: canvasContexts.dataContext.currentScale,
      translateX: canvasContexts.dataContext.currentTranslation.x,
      translateY: canvasContexts.dataContext.currentTranslation.y
    }),
    []
  );

  const providers = useMemo(
    () => [
      // DATA
      // The main provider used to react on graph changes and update
      // components data accordingly
      <ComponentsDataProvider
        graph={graph}
        renderers={memoRenderers}
        settings={memoSettings}
      />,
      // LAYOUT
      // Providers used to compute the layout of the graph and animate
      // vertices based on calculated positions
      ...getLayoutProviders(graph, memoSettings),
      // Provider used to compute the dimensions of the container
      <ContainerDimensionsProvider
        vertexRadius={memoSettings.components.vertex.radius}
      />,
      // EVENTS
      // Press events provider
      ...getEventsProviders(transform, memoSettings),
      // FOCUS
      // Provider used to focus on a specific vertex
      <VertexFocusProvider
        graph={graph}
        vertexRadius={memoSettings.components.vertex.radius}
      />,
      // Provider used to focus one of the vertices specified in an
      // array based on the user-defined progress
      ...(memoSettings.focus
        ? [
            <MultiStepVertexFocusProvider
              settings={memoSettings.focus}
              vertexRadius={memoSettings.components.vertex.radius}
            />
          ]
        : [])
    ],
    [memoRenderers]
  );

  return (
    <CanvasContextsContext.Provider value={canvasContexts}>
      <ContextProviderComposer providers={providers}>
        {children}
      </ContextProviderComposer>
    </CanvasContextsContext.Provider>
  );
}

export default memo(
  GraphProvider,
  deepMemoComparator({
    include: ['graph', 'renderers', 'settings'],
    shallow: ['graph']
  })
) as typeof GraphProvider;

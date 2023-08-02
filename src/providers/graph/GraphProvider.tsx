import { memo, PropsWithChildren, useMemo } from 'react';

import {
  DirectedGraphComponentProps,
  UndirectedGraphComponentProps
} from '@/components/graphs';
import { ContextProviderComposer } from '@/providers/utils';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { Graph } from '@/types/graphs';
import { GraphSettingsWithDefaults } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

import CanvasContextsProvider, {
  CanvasContexts
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
import { MultiStepVertexFocusProvider, VertexFocusProvider } from './focus';
import GraphDataProvider from './data/GraphDataProvider';

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

type GraphProviderProps<V, E> = PropsWithChildren<{
  canvasContexts: CanvasContexts;
  graphProps:
    | DirectedGraphComponentProps<V, E>
    | UndirectedGraphComponentProps<V, E>;
}>;

function GraphProvider<V, E>({
  canvasContexts,
  children,
  graphProps
}: GraphProviderProps<V, E>) {
  // TODO
  const providers = useMemo(
    () => [
      // DATA
      // The main provider used to react on graph changes and update
      // components data accordingly
      <ComponentsDataProvider />,
      // LAYOUT
      // Providers used to compute the layout of the graph and animate
      // vertices based on calculated positions
      // ...getLayoutProviders(), // TODO - add conditional providers
      // Provider used to compute the dimensions of the container
      <ContainerDimensionsProvider />,
      // EVENTS
      // Press events provider
      // ...getEventsProviders(), // TODO - add conditional providers
      // FOCUS
      // Provider used to focus on a specific vertex
      <VertexFocusProvider />
      // Provider used to focus one of the vertices specified in an
      // array based on the user-defined progress
      // ...(memoSettings.focus ? [<MultiStepVertexFocusProvider />] : []) // TODO - add conditional providers
    ],
    []
  );

  return (
    <CanvasContextsProvider canvasContexts={canvasContexts}>
      <GraphDataProvider {...graphProps}>
        <ContextProviderComposer providers={providers}>
          {children}
        </ContextProviderComposer>
      </GraphDataProvider>
    </CanvasContextsProvider>
  );
}

export default memo(
  GraphProvider,
  deepMemoComparator({
    include: ['graph', 'renderers', 'settings'],
    shallow: ['graph']
  })
) as typeof GraphProvider;

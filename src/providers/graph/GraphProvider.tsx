import { memo, PropsWithChildren, useMemo } from 'react';

import {
  DirectedGraphComponentProps,
  UndirectedGraphComponentProps
} from '@/components/graphs';
import { ContextProviderComposer } from '@/providers/utils';
import ConditionalProvider from '@/providers/utils/ConditionalProvider';
import { deepMemoComparator } from '@/utils/objects';

import CanvasContextsProvider, {
  CanvasContexts
} from './contexts/CanvasContextsProvider';
import { ComponentsDataProvider } from './data/components';
import GraphDataProvider from './data/GraphDataProvider';
import { PressEventsProvider } from './events';
import { MultiStepVertexFocusProvider, VertexFocusProvider } from './focus';
import {
  ContainerDimensionsProvider,
  ForcesLayoutProvider,
  ForcesPlacementProvider,
  PlacementLayoutProvider
} from './layout';

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
  const providers = useMemo(
    () => [
      // DATA
      // The main provider used to react on graph changes and update
      // components data accordingly
      <ComponentsDataProvider />,
      // LAYOUT
      // Providers used to compute the layout of the graph and animate
      // vertices based on calculated positions
      <ConditionalProvider.Switch
        case={{
          forces: [
            // Provider used to place vertices on graph changes
            <ForcesPlacementProvider />,
            // Provider used to animate vertices based on calculated forces
            <ForcesLayoutProvider />
          ],
          // Provider used to place and move vertices on graph changes
          placement: <PlacementLayoutProvider />
        }}
        match={({ settings }) => settings.layout.managedBy}
      />,
      // CONTAINER
      // Provider used to compute the dimensions of the container
      <ContainerDimensionsProvider />,
      // EVENTS
      // Press events provider
      <ConditionalProvider.If
        if={({ settings }) => !!settings.events}
        then={<PressEventsProvider />}
      />,
      // FOCUS
      // Provider used to focus on a specific vertex
      <VertexFocusProvider />,
      // Provider used to focus one of the vertices specified in an
      // array based on the user-defined progress
      <ConditionalProvider.If
        if={({ settings }) => !!settings.focus}
        then={<MultiStepVertexFocusProvider />}
      />
    ],
    []
  );

  return (
    <CanvasContextsProvider canvasContexts={canvasContexts}>
      <GraphDataProvider {...graphProps}>
        <ContextProviderComposer providers={providers}>
          {/* {children} */}
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

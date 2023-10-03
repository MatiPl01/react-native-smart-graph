/* eslint-disable react/jsx-key */
import { PropsWithChildren, useMemo } from 'react';

import { ContextProviderComposer } from '@/providers/utils';
import { GraphData } from '@/types/data';
import { AnimatedTransformation } from '@/types/layout';

import { EdgesMaskProvider } from './appearance';
import ConditionalProvider from './ConditionalProvider';
import CanvasContextsProvider, {
  CanvasContexts
} from './contexts/CanvasContextsProvider';
import { ComponentsDataProvider, GraphSettingsProvider } from './data';
import { PressEventsProvider } from './events';
import { MultiStepVertexFocusProvider, VertexFocusProvider } from './focus';
import {
  ContainerDimensionsProvider,
  ForcesLayoutProvider,
  ForcesPlacementProvider,
  PlacementLayoutProvider
} from './layout';
import { SettingsChangeResponderProvider } from './settings';

type GraphProviderProps<V, E> = PropsWithChildren<{
  canvasContexts: CanvasContexts;
  graphProps: GraphData<V, E>;
  transform: AnimatedTransformation;
}>;

export default function GraphProvider<V, E>({
  canvasContexts,
  children,
  graphProps,
  transform
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
        match={({ layoutSettings }) => layoutSettings.type}
        case={{
          // Provider used to place and move vertices on graph changes
          auto: <PlacementLayoutProvider />,
          force: [
            // Provider used to place vertices on graph changes
            <ForcesPlacementProvider />,
            // Provider used to animate vertices based on calculated forces
            <ForcesLayoutProvider />
          ]
        }}
      />,
      // CONTAINER
      // Provider used to compute the dimensions of the container
      <ContainerDimensionsProvider />,
      // FOCUS
      // Provider used to focus on a specific vertex
      <VertexFocusProvider />,
      // Provider used to focus one of the vertices specified in an
      // array based on the user-defined progress
      <ConditionalProvider.If
        if={({ focusSettings }) => !!focusSettings}
        then={<MultiStepVertexFocusProvider />}
      />,
      // EVENTS
      // Press events provider
      // TODO - improve press events provider (the overlay layer degrades performance)
      <ConditionalProvider.If
        if={({ eventSettings }) => !!eventSettings?.press}
        then={<PressEventsProvider transform={transform} />}
      />,
      // SETTINGS
      // The provider used to handle canvas settings change and respond to such changes
      <SettingsChangeResponderProvider />,
      // EDGES MASK
      <EdgesMaskProvider />
    ],
    []
  );

  return (
    <CanvasContextsProvider canvasContexts={canvasContexts}>
      <GraphSettingsProvider {...graphProps}>
        <ContextProviderComposer providers={providers}>
          {children}
        </ContextProviderComposer>
      </GraphSettingsProvider>
    </CanvasContextsProvider>
  );
}

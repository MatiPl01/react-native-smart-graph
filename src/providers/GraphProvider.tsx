import { PropsWithChildren, useMemo } from 'react';

import { AccessibleOverlayContextType } from '@/contexts/OverlayProvider';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { Graph } from '@/types/graphs';
import { AnimatedBoundingRect } from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings, GraphSettingsWithDefaults } from '@/types/settings';
import {
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults
} from '@/utils/components';

import { ComponentsDataProvider } from './data';
import PressEventsProvider, {
  PressEventsProviderProps
} from './events/PressEventsProvider';
import {
  ForcesLayoutProvider,
  ForcesPlacementProvider,
  GraphPlacementLayoutProviderProps,
  PlacementLayoutProvider
} from './layout';
import ContainerDimensionsProvider from './layout/ContainerDimensionsProvider';
import { ContextProviderComposer } from './utils';

const getLayoutProviders = <
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(
  graph: Graph<V, E>,
  settings: GraphSettingsWithDefaults<V, E, ED>
) => {
  switch (settings.layout.managedBy) {
    case 'forces':
      return [
        <ForcesPlacementProvider
          vertexRadius={settings.components.vertex.radius}
        />,
        <ForcesLayoutProvider forcesSettings={settings.layout.settings} />
      ];
    case 'placement':
    default:
      return [
        <PlacementLayoutProvider<GraphPlacementLayoutProviderProps<V, E, ED>>
          graph={graph}
          settings={settings}
        />
      ];
  }
};

const getEventsProviders = <
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(
  boundingRect: AnimatedBoundingRect,
  settings: GraphSettingsWithDefaults<V, E, ED>,
  renderLayer: (zIndex: number, layer: JSX.Element) => void
) => {
  if (settings.events) {
    return [
      <PressEventsProvider<PressEventsProviderProps<V, E, ED>>
        boundingRect={boundingRect}
        renderLayer={renderLayer}
        settings={settings}
      />
    ];
  }
  return [];
};

export type GraphProviderAdditionalProps =
  | {
      boundingRect: AnimatedBoundingRect;
    } & AccessibleOverlayContextType;

type GraphProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<
  {
    graph: Graph<V, E>;
    renderers?: GraphRenderers<V, E>;
    settings?: GraphSettings<V, E, ED>;
  } & GraphProviderAdditionalProps
>;

// eslint-disable-next-line import/no-unused-modules
export default function GraphProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  boundingRect,
  children,
  graph,
  renderLayer,
  renderers,
  settings
}: GraphProviderProps<V, E, ED>) {
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
      // DATA
      // The main provider used to react on graph changes and update
      // components data accordingly
      <ComponentsDataProvider
        graph={graph}
        renderers={memoRenderers}
        settings={memoSettings}
      />,
      // LAYOUT
      // Provider used to compute the dimensions of the container
      <ContainerDimensionsProvider boundingRect={boundingRect} />,
      // Providers used to compute the layout of the graph and animate
      // vertices based on calculated positions
      ...getLayoutProviders(graph, memoSettings),
      // EVENTS
      // Press events provider
      ...getEventsProviders(boundingRect, memoSettings, renderLayer)
    ],
    [memoSettings]
  );

  return (
    <ContextProviderComposer providers={providers}>
      {children}
    </ContextProviderComposer>
  );
}

import { PropsWithChildren, useMemo } from 'react';

import { Graph } from '@/types/graphs';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings, GraphSettingsWithDefaults } from '@/types/settings';
import {
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults
} from '@/utils/components';

import { ComponentsDataProvider } from './data';
import {
  ForcesLayoutProvider,
  ForcesPlacementProvider,
  GraphPlacementLayoutProviderProps,
  PlacementLayoutProvider
} from './layout';
import { ContextProviderComposer } from './utils';

const getLayoutProviders = <V, E>(
  graph: Graph<V, E>,
  settings: GraphSettingsWithDefaults<V, E>
) => {
  switch (settings.layout.managedBy) {
    case 'forces':
      const forcesSettings = settings.layout.settings;
      return [
        <ForcesPlacementProvider
          forcesSettings={forcesSettings}
          vertexRadius={settings.components.vertex.radius}
        />,
        <ForcesLayoutProvider forcesSettings={forcesSettings} />
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

type GraphProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  renderers?: GraphRenderers<V, E>;
  settings?: GraphSettings<V, E>;
}>;

// eslint-disable-next-line import/no-unused-modules
export default function GraphProvider<V, E>({
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

  const providers = useMemo(
    () => [
      // The main provider used to react on graph changes and update
      // components data accordingly
      <ComponentsDataProvider
        graph={graph}
        renderers={memoRenderers}
        settings={memoSettings}
      />,
      // Providers used to compute the layout of the graph and animate
      // vertices based on calculated positions
      ...getLayoutProviders(graph, memoSettings)
    ],
    [memoSettings]
  );

  return (
    <ContextProviderComposer providers={providers}>
      {children}
    </ContextProviderComposer>
  );
}

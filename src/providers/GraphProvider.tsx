import { PropsWithChildren, useMemo } from 'react';

import { Graph } from '@/types/graphs';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings } from '@/types/settings';
import {
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults
} from '@/utils/components';

import ComponentsDataProvider from './ComponentsDataProvider';
import ForcesLayoutProvider from './layout/ForcesLayoutProvider';
import ProvidersComposer from './utils/ProvidersComposer';

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
      />,
      <ForcesLayoutProvider graph={graph} settings={memoSettings} />
    ],
    [memoSettings]
  );

  return (
    <ProvidersComposer providers={providers}>{children}</ProvidersComposer>
  );
}

import { memo } from 'react';

import { UndirectedGraph } from '@/models/graphs';
import { GraphProviderAdditionalProps } from '@/providers/graph';
import GraphProvider from '@/providers/graph/GraphProvider';
import { UndirectedEdgeData } from '@/types/data';
import { UndirectedGraphRenderers } from '@/types/renderer';
import { UndirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

import GraphComponent from './graph/GraphComponent';

export type UndirectedGraphComponentProps<V, E> = {
  graph: UndirectedGraph<V, E>;
  renderers?: UndirectedGraphRenderers<V, E>;
  settings?: UndirectedGraphSettings<V, E, UndirectedEdgeData<E>>;
};

type ClonedComponentProps<V, E> = UndirectedGraphComponentProps<V, E> &
  GraphProviderAdditionalProps;

function UndirectedGraphComponent<V, E>(
  providerProps: ClonedComponentProps<V, E>
) {
  return (
    <GraphProvider {...providerProps}>
      <GraphComponent />
    </GraphProvider>
  );
}

export default memo(
  <V, E>(props: UndirectedGraphComponentProps<V, E>) => {
    return (
      <UndirectedGraphComponent {...(props as ClonedComponentProps<V, E>)} />
    );
  },
  deepMemoComparator({
    shallow: ['graph']
  })
) as <V, E>(props: UndirectedGraphComponentProps<V, E>) => JSX.Element;

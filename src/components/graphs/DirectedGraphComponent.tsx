import { memo } from 'react';

import { DirectedGraph } from '@/models/graphs';
import { GraphProviderAdditionalProps } from '@/providers/graph';
import GraphProvider from '@/providers/graph/GraphProvider';
import { DirectedEdgeData } from '@/types/data';
import { DirectedGraphRenderers } from '@/types/renderer';
import { DirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

import GraphComponent from './graph/GraphComponent';

export type DirectedGraphComponentProps<V, E> = {
  graph: DirectedGraph<V, E>;
  renderers?: DirectedGraphRenderers<V, E>;
  settings?: DirectedGraphSettings<V, E, DirectedEdgeData<E>>;
};

type ClonedComponentProps<V, E> = DirectedGraphComponentProps<V, E> &
  GraphProviderAdditionalProps;

function DirectedGraphComponent<V, E>(
  providerProps: ClonedComponentProps<V, E>
) {
  return (
    <GraphProvider {...providerProps}>
      <GraphComponent />
    </GraphProvider>
  );
}

export default memo(
  <V, E>(props: DirectedGraphComponentProps<V, E>) => {
    console.log('DirectedGraphComponent');
    return (
      <DirectedGraphComponent {...(props as ClonedComponentProps<V, E>)} />
    );
  },
  deepMemoComparator({
    shallow: ['graph']
  })
) as <V, E>(props: DirectedGraphComponentProps<V, E>) => JSX.Element;

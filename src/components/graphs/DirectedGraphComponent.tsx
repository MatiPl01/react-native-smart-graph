import { memo } from 'react';

import { DirectedGraph } from '@/models/graphs';
import { GraphProvider, GraphProviderAdditionalProps } from '@/providers/graph';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { DirectedGraphRenderers } from '@/types/renderer';
import { DirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

import GraphComponent, { GraphComponentProps } from './GraphComponent';

type DirectedGraphComponentProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  graph: DirectedGraph<V, E>;
  renderers?: DirectedGraphRenderers<V, E>;
  settings?: DirectedGraphSettings<V, E, ED>;
};

type ClonedComponentProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = DirectedGraphComponentProps<V, E, ED> & {
  graphComponentProps: GraphComponentProps;
} & GraphProviderAdditionalProps;

function DirectedGraphComponent<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({ graphComponentProps, ...providerProps }: ClonedComponentProps<V, E, ED>) {
  return (
    <GraphProvider {...providerProps}>
      <GraphComponent {...graphComponentProps} />
    </GraphProvider>
  );
}

export default memo(
  <V, E, ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>>(
    props: DirectedGraphComponentProps<V, E, ED>
  ) => {
    return (
      <DirectedGraphComponent {...(props as ClonedComponentProps<V, E, ED>)} />
    );
  },
  deepMemoComparator({
    exclude: ['boundingRect'],
    shallow: ['graph']
  })
);

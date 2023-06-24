import { memo } from 'react';

import { UndirectedGraph } from '@/models/graphs';
import { GraphProvider, GraphProviderAdditionalProps } from '@/providers/graph';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { UndirectedGraphRenderers } from '@/types/renderer';
import { UndirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

import GraphComponent, { GraphComponentProps } from './GraphComponent';

type UndirectedGraphComponentProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  graph: UndirectedGraph<V, E>;
  renderers?: UndirectedGraphRenderers<V, E>;
  settings?: UndirectedGraphSettings<V, E, ED>;
};

type ClonedComponentProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = UndirectedGraphComponentProps<V, E, ED> & {
  graphComponentProps: GraphComponentProps;
} & GraphProviderAdditionalProps;

function UndirectedGraphComponent<
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
    props: UndirectedGraphComponentProps<V, E, ED>
  ) => {
    return (
      <UndirectedGraphComponent
        {...(props as ClonedComponentProps<V, E, ED>)}
      />
    );
  },
  deepMemoComparator({
    exclude: ['boundingRect'],
    shallow: ['graph']
  })
);

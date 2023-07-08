import { memo } from 'react';

import GraphComponent from '@/components/graphs/graph/GraphComponent';
import { UndirectedGraph } from '@/models/graphs';
import { GraphProviderAdditionalProps } from '@/providers/graph';
import GraphProvider from '@/providers/graph/GraphProvider';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { UndirectedGraphRenderers } from '@/types/renderer';
import { UndirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

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
> = UndirectedGraphComponentProps<V, E, ED> & GraphProviderAdditionalProps;

function UndirectedGraphComponent<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>(providerProps: ClonedComponentProps<V, E, ED>) {
  return (
    <GraphProvider {...providerProps}>
      <GraphComponent />
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
) as <V, E, ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>>(
  props: UndirectedGraphComponentProps<V, E, ED>
) => JSX.Element;

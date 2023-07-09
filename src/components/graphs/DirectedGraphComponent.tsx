import { memo } from 'react';

import GraphComponent from '@/components/graphs/graph/GraphComponent';
import { DirectedGraph } from '@/models/graphs';
import { GraphProviderAdditionalProps } from '@/providers/graph';
import GraphProvider from '@/providers/graph/GraphProvider';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { DirectedGraphRenderers } from '@/types/renderer';
import { DirectedGraphSettings } from '@/types/settings';

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
> = DirectedGraphComponentProps<V, E, ED> & GraphProviderAdditionalProps;

function DirectedGraphComponent<
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
    props: DirectedGraphComponentProps<V, E, ED>
  ) => {
    console.log('DirectedGraphComponent');
    return null;
    return (
      <DirectedGraphComponent {...(props as ClonedComponentProps<V, E, ED>)} />
    );
  },
  // deepMemoComparator({
  //   exclude: ['boundingRect'],
  //   shallow: ['graph']
  // })
  () => true
) as <V, E, ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>>(
  props: DirectedGraphComponentProps<V, E, ED>
) => JSX.Element;

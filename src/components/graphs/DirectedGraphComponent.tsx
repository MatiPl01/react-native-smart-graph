import { memo } from 'react';

import { AccessibleOverlayContextType } from '@/contexts/OverlayProvider';
import { DirectedGraph } from '@/models/graphs';
import GraphProvider from '@/providers/GraphProvider';
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
> = DirectedGraphComponentProps<V, E, ED> &
  GraphComponentProps &
  AccessibleOverlayContextType;

function DirectedGraphComponent<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  boundingRect,
  onRender,
  ...providerProps
}: ClonedComponentProps<V, E, ED>) {
  return (
    <GraphProvider {...providerProps}>
      <GraphComponent boundingRect={boundingRect} onRender={onRender} />
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

import { memo } from 'react';

import { AccessibleOverlayContextType } from '@/contexts/OverlayProvider';
import { UndirectedGraph } from '@/models/graphs';
import GraphProvider from '@/providers/GraphProvider';
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
> = UndirectedGraphComponentProps<V, E, ED> &
  GraphComponentProps &
  AccessibleOverlayContextType;

function UndirectedGraphComponent<
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

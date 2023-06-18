import { memo } from 'react';

import { DirectedGraph } from '@/models/graphs';
import GraphProvider from '@/providers/GraphProvider';
import { DirectedGraphRenderers } from '@/types/renderer';
import { DirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

import GraphComponent, { GraphComponentProps } from './GraphComponent';

type DirectedGraphComponentProps<V, E> = {
  graph: DirectedGraph<V, E>;
  renderers?: DirectedGraphRenderers<V, E>;
  settings?: DirectedGraphSettings<V, E>;
};

function DirectedGraphComponent<V, E>({
  boundingRect,
  onRender,
  ...providerProps
}: DirectedGraphComponentProps<V, E> & GraphComponentProps) {
  return (
    <GraphProvider {...providerProps}>
      <GraphComponent boundingRect={boundingRect} onRender={onRender} />
    </GraphProvider>
  );
}

export default memo(
  <V, E>(props: DirectedGraphComponentProps<V, E>) => {
    return (
      <DirectedGraphComponent
        {...(props as DirectedGraphComponentProps<V, E> & GraphComponentProps)}
      />
    );
  },
  deepMemoComparator({
    exclude: ['boundingRect'],
    shallow: ['graph']
  })
);

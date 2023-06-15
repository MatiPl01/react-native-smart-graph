import { memo } from 'react';

import { UndirectedGraph } from '@/models/graphs';
import GraphProvider from '@/providers/GraphProvider';
import { UndirectedGraphRenderers } from '@/types/renderer';
import { UndirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

import GraphComponent, { GraphComponentProps } from './GraphComponent';

type UndirectedGraphComponentProps<V, E> = {
  graph: UndirectedGraph<V, E>;
  settings?: UndirectedGraphSettings<V, E>;
  renderers?: UndirectedGraphRenderers<V, E>;
};

function UndirectedGraphComponent<V, E>({
  boundingRect,
  onRender,
  ...providerProps
}: UndirectedGraphComponentProps<V, E> & GraphComponentProps) {
  return (
    <GraphProvider {...providerProps}>
      <GraphComponent boundingRect={boundingRect} onRender={onRender} />
    </GraphProvider>
  );
}

export default memo(
  <V, E>(props: UndirectedGraphComponentProps<V, E>) => {
    return (
      <UndirectedGraphComponent
        {...(props as UndirectedGraphComponentProps<V, E> &
          GraphComponentProps)}
      />
    );
  },
  deepMemoComparator({
    shallow: ['graph'],
    exclude: ['boundingRect']
  })
);

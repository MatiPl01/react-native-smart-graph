import { memo } from 'react';

import GraphComponentComposer from '@/components/views/GraphComponentComposer';
import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphRenderers } from '@/types/renderer';
import { DirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/equality';

export type DirectedGraphComponentProps<V, E> = {
  graph: DirectedGraph<V, E>;
  renderers?: DirectedGraphRenderers<V, E>;
  settings?: DirectedGraphSettings<V, E>;
};

function DirectedGraphComponent<V, E>(
  props: DirectedGraphComponentProps<V, E>
) {
  console.log('DirectedGraphComponent');

  return (
    <GraphComponentComposer<V, E, DirectedGraphComponentProps<V, E>>
      {...props}
    />
  );
}

export default memo(
  DirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof DirectedGraphComponent;

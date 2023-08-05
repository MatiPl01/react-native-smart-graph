import { memo } from 'react';

import GraphComponentComposer from '@/components/views/GraphComponentComposer';
import { DirectedGraph } from '@/models/graphs';
import { DirectedGraphRenderers } from '@/types/renderers';
import { DirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/objects';

export type DirectedGraphComponentProps<V, E> = {
  graph: DirectedGraph<V, E>;
  renderers?: DirectedGraphRenderers<V, E>;
  settings?: DirectedGraphSettings<V>;
};

function DirectedGraphComponent<V, E>(
  props: DirectedGraphComponentProps<V, E>
) {
  return <GraphComponentComposer {...props} />;
}

export default memo(
  DirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof DirectedGraphComponent;

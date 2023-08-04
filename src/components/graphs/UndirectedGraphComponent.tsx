import { memo } from 'react';

import GraphComponentComposer from '@/components/views/GraphComponentComposer';
import { UndirectedGraph } from '@/models/graphs';
import { UndirectedGraphRenderers } from '@/types/renderer';
import { UndirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/objects';

export type UndirectedGraphComponentProps<V, E> = {
  graph: UndirectedGraph<V, E>;
  renderers?: UndirectedGraphRenderers<V, E>;
  settings?: UndirectedGraphSettings<V>;
};

function UndirectedGraphComponent<V, E>(
  props: UndirectedGraphComponentProps<V, E>
) {
  return (
    <GraphComponentComposer<V, E, UndirectedGraphComponentProps<V, E>>
      {...props}
    />
  );
}

export default memo(
  UndirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof UndirectedGraphComponent;

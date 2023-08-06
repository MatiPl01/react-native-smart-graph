import { memo } from 'react';

import GraphComponentComposer from '@/components/views/GraphComponentComposer';
import { UndirectedGraphComponentProps } from '@/types/components';
import { UndirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/objects';

function UndirectedGraphComponent<V, E, S extends UndirectedGraphSettings<V>>(
  props: UndirectedGraphComponentProps<V, E, S>
) {
  return <GraphComponentComposer {...props} />;
}

export default memo(
  UndirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof UndirectedGraphComponent;

import { memo } from 'react';

import { GraphComponentComposer } from '@/components/views';
import { UndirectedGraphComponentProps } from '@/types/components';
import { EdgeType } from '@/types/settings';
import { deepMemoComparator } from '@/utils/objects';

function UndirectedGraphComponent<V, E, ET extends EdgeType>(
  props: UndirectedGraphComponentProps<V, E, ET>
) {
  return <GraphComponentComposer {...props} />;
}

export default memo(
  UndirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof UndirectedGraphComponent;

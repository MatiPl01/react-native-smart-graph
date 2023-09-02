import { memo } from 'react';

import { GraphComponentComposer } from '@/components/views';
import { DirectedGraphComponentProps } from '@/types/components';
import { EdgeType } from '@/types/settings';
import { deepMemoComparator } from '@/utils/objects';

function DirectedGraphComponent<V, E, ET extends EdgeType>(
  props: DirectedGraphComponentProps<V, E, ET>
) {
  return <GraphComponentComposer {...props} />;
}

export default memo(
  DirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof DirectedGraphComponent;

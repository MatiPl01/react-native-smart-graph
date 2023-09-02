import { memo } from 'react';

import { GraphComponentComposer } from '@/components/views';
import { DirectedGraphComponentProps } from '@/types/components';
import { deepMemoComparator } from '@/utils/objects';

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

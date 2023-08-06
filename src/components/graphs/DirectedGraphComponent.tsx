import { memo } from 'react';

import { GraphComponentComposer } from '@/components/views';
import { DirectedGraphComponentProps } from '@/types/components';
import { DirectedGraphSettings } from '@/types/settings';
import { deepMemoComparator } from '@/utils/objects';

function DirectedGraphComponent<V, E, S extends DirectedGraphSettings<V>>(
  props: DirectedGraphComponentProps<V, E, S>
) {
  return <GraphComponentComposer {...props} />;
}

export default memo(
  DirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof DirectedGraphComponent;

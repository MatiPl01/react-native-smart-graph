/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';

import { GraphComponentComposer } from '@/components/views';
import {
  CurvedEdgeRenderer,
  DirectedGraphComponentProps,
  EdgeArrowRenderer,
  EdgeLabelRenderer,
  StraightEdgeRenderer,
  VertexLabelRenderer,
  VertexMaskRenderer,
  VertexRenderer
} from '@/types/components';
import { EdgeType } from '@/types/settings';
import { deepMemoComparator } from '@/utils/objects';

function DirectedGraphComponent<
  V,
  E,
  VR extends VertexRenderer<V, any>,
  VLR extends VertexLabelRenderer<V, any>,
  VMR extends VertexMaskRenderer<any>,
  ER extends CurvedEdgeRenderer<E, any> | StraightEdgeRenderer<E, any>,
  ELR extends EdgeLabelRenderer<E, any>,
  EAR extends EdgeArrowRenderer<any>,
  ET extends EdgeType = 'straight'
>(props: DirectedGraphComponentProps<V, E, VR, VLR, VMR, ER, ELR, EAR, ET>) {
  return <GraphComponentComposer {...props} />;
}

export default memo(
  DirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof DirectedGraphComponent;

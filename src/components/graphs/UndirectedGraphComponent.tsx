/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';

import { GraphComponentComposer } from '@/components/views';
import {
  CurvedEdgeRenderer,
  EdgeLabelRenderer,
  StraightEdgeRenderer,
  UndirectedGraphComponentProps,
  VertexLabelRenderer,
  VertexMaskRenderer,
  VertexRenderer
} from '@/types/components';
import { EdgeType } from '@/types/settings';
import { deepMemoComparator } from '@/utils/objects';

function UndirectedGraphComponent<
  V,
  E,
  VR extends VertexRenderer<V, any>,
  VLR extends VertexLabelRenderer<V, any>,
  VMR extends VertexMaskRenderer<any>,
  ER extends CurvedEdgeRenderer<E, any> | StraightEdgeRenderer<E, any>,
  ELR extends EdgeLabelRenderer<E, any>,
  ET extends EdgeType = 'straight'
>(props: UndirectedGraphComponentProps<V, E, VR, VLR, VMR, ER, ELR, ET>) {
  return <GraphComponentComposer {...props} />;
}

export default memo(
  UndirectedGraphComponent,
  deepMemoComparator({
    shallow: ['graph']
  })
) as typeof UndirectedGraphComponent;

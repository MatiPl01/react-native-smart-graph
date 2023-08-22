import { memo } from 'react';

import {
  CurvedEdgeRenderer,
  CurvedEdgeRendererProps
} from '@/types/components';

type RenderedCurvedEdgeComponentProps<E> = Omit<
  CurvedEdgeRendererProps<E>,
  'key'
> & {
  edgeKey: string;
  renderer: CurvedEdgeRenderer<E>;
};

function RenderedCurvedEdgeComponent<E>({
  edgeKey: key,
  renderer,
  ...restProps
}: RenderedCurvedEdgeComponentProps<E>) {
  return renderer({ key, ...restProps });
}

export default memo(RenderedCurvedEdgeComponent) as <E>(
  props: RenderedCurvedEdgeComponentProps<E>
) => JSX.Element;

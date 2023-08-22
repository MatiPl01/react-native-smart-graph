import { memo } from 'react';

import {
  StraightEdgeRenderer,
  StraightEdgeRendererProps
} from '@/types/components';

type RenderedStraightEdgeComponentProps<E> = Omit<
  StraightEdgeRendererProps<E>,
  'key'
> & {
  edgeKey: string;
  renderer: StraightEdgeRenderer<E>;
};

function RenderedCurvedEdgeComponent<E>({
  edgeKey: key,
  renderer,
  ...restProps
}: RenderedStraightEdgeComponentProps<E>) {
  return renderer({ key, ...restProps });
}

export default memo(RenderedCurvedEdgeComponent) as <E>(
  props: RenderedStraightEdgeComponentProps<E>
) => JSX.Element;

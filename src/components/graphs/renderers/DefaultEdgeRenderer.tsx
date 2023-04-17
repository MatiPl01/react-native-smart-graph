import { Line } from '@shopify/react-native-skia';

import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { AnimatedPosition } from '@/types/layout';
import { EdgeRendererProps } from '@/types/renderer';
import { areDirectedEdgeRendererProps } from '@/utils/renderer';

export default function DefaultEdgeRenderer<E, R extends EdgeRendererProps<E>>(
  props: R
) {
  let p1: AnimatedPosition, p2: AnimatedPosition;
  if (areDirectedEdgeRendererProps(props)) {
    ({ from: p1, to: p2 } = props);
  } else {
    [p1, p2] = props.points;
  }

  return (
    <Line
      p1={p1}
      p2={p2}
      color={DEFAULT_EDGE_RENDERER_SETTINGS.color}
      style='stroke'
      strokeWidth={1}
    />
  );
}

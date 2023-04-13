import { SharedValue } from 'react-native-reanimated';

import { Line } from '@shopify/react-native-skia';

import { EdgeRendererProps } from '@/types/render';
import { areDirectedEdgeRendererProps } from '@/utils/renderer';

export default function DefaultEdgeRenderer<E, R extends EdgeRendererProps<E>>(
  props: R
) {
  let p1: SharedValue<{ x: number; y: number }>,
    p2: SharedValue<{ x: number; y: number }>;
  if (areDirectedEdgeRendererProps(props)) {
    ({ from: p1, to: p2 } = props);
  } else {
    [p1, p2] = props.points;
  }

  return (
    <Line p1={p1} p2={p2} color='lightblue' style='stroke' strokeWidth={1} />
  );
}

import { useDerivedValue } from 'react-native-reanimated';

import { Line } from '@shopify/react-native-skia';

import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { AnimatedVector } from '@/types/layout';
import { EdgeRendererProps } from '@/types/renderer';
import { areDirectedEdgeRendererProps } from '@/utils/renderers';

export default function DefaultEdgeRenderer<E, R extends EdgeRendererProps<E>>(
  props: R
) {
  const animationProgress = props.animationProgress;
  let p1Target: AnimatedVector, p2Target: AnimatedVector;

  if (areDirectedEdgeRendererProps(props)) {
    ({ from: p1Target, to: p2Target } = props);
  } else {
    [p1Target, p2Target] = props.points;
  }

  const center = useDerivedValue(() => ({
    x: (p1Target.value.x + p2Target.value.x) / 2,
    y: (p1Target.value.y + p2Target.value.y) / 2
  }));
  const p1 = useDerivedValue(() => ({
    x:
      center.value.x +
      (p1Target.value.x - center.value.x) * animationProgress.value,
    y:
      center.value.y +
      (p1Target.value.y - center.value.y) * animationProgress.value
  }));
  const p2 = useDerivedValue(() => ({
    x:
      center.value.x +
      (p2Target.value.x - center.value.x) * animationProgress.value,
    y:
      center.value.y +
      (p2Target.value.y - center.value.y) * animationProgress.value
  }));

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

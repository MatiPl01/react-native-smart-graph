import { Line } from '@shopify/react-native-skia';
import { interpolate, useDerivedValue } from 'react-native-reanimated';

import { StraightEdgeRendererProps } from '@/types/components';

export default function DefaultStraightEdgeRenderer<E>({
  animationProgress,
  focusProgress,
  p1: p1Target,
  p2: p2Target
}: StraightEdgeRendererProps<E>) {
  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

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
      color='#999'
      opacity={opacity}
      p1={p1}
      p2={p2}
      strokeWidth={1}
      style='stroke'
    />
  );
}

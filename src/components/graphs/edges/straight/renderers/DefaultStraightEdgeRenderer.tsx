import { Line } from '@shopify/react-native-skia';
import { interpolate, useDerivedValue } from 'react-native-reanimated';

import { StraightEdgeRendererProps } from '@/types/components';
import { addVectors, multiplyVector, subtractVectors } from '@/utils/vectors';

export default function DefaultStraightEdgeRenderer<E>({
  animationProgress,
  focusProgress,
  p1: p1Target,
  p2: p2Target
}: StraightEdgeRendererProps<E>) {
  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  const center = useDerivedValue(() =>
    multiplyVector(addVectors(p1Target.value, p2Target.value), 0.5)
  );

  const p1 = useDerivedValue(() =>
    addVectors(
      center.value,
      multiplyVector(
        subtractVectors(p1Target.value, center.value),
        animationProgress.value
      )
    )
  );

  const p2 = useDerivedValue(() =>
    addVectors(
      center.value,
      multiplyVector(
        subtractVectors(p2Target.value, center.value),
        animationProgress.value
      )
    )
  );

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

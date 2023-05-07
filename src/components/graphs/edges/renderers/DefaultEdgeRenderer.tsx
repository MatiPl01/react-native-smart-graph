import { useEffect } from 'react';
import {
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { Line } from '@shopify/react-native-skia';

import EASING from '@/constants/easings';
import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { AnimatedVector } from '@/types/layout';
import { EdgeRendererProps } from '@/types/renderer';
import { areDirectedEdgeRendererProps } from '@/utils/renderer';

export default function DefaultEdgeRenderer<E, R extends EdgeRendererProps<E>>(
  props: R
) {
  let p1Target: AnimatedVector, p2Target: AnimatedVector;
  const animationProgress = useSharedValue(0);

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

  useEffect(() => {
    // Animate edge on mount
    animationProgress.value = withTiming(1, {
      duration: 500,
      easing: EASING.bounce
    });
  }, []);

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

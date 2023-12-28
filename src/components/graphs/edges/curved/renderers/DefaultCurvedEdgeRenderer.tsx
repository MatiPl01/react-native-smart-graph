import { Path } from '@shopify/react-native-skia';
import {
  interpolate,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { CurvedEdgeRendererProps } from '@/types/components';

export default function DefaultCurvedEdgeRenderer<E>({
  animationProgress,
  focusProgress,
  path
}: CurvedEdgeRendererProps<E>) {
  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  const start = useSharedValue(0.5);
  const end = useSharedValue(0.5);

  useAnimatedReaction(
    () => animationProgress.value,
    progress => {
      start.value = 0.5 - progress / 2;
      end.value = 0.5 + progress / 2;
    }
  );

  return (
    <Path
      color='#999'
      end={end}
      opacity={opacity}
      path={path}
      start={start}
      strokeWidth={1}
      style='stroke'
    />
  );
}

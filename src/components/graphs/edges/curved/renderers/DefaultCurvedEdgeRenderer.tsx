/* eslint-disable import/no-unused-modules */
import { Path } from '@shopify/react-native-skia';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { CurvedEdgeRendererProps } from '@/types/components';

export default function DefaultCurvedEdgeRenderer<E>({
  animationProgress,
  path,
  vertexScale
}: CurvedEdgeRendererProps<E>) {
  const start = useSharedValue(0.5);
  const end = useSharedValue(0.5);

  const strokeWidth = useDerivedValue(() => vertexScale.value * 2);

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
      path={path}
      start={start}
      strokeWidth={strokeWidth}
      style='stroke'
    />
  );
}

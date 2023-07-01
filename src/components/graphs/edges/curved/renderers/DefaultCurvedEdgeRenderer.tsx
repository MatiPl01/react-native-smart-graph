import { Path } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { CurvedEdgeRendererProps } from '@/types/renderer';

export default function DefaultCurvedEdgeRenderer<E>({
  animationProgress,
  focusTransitionProgress,
  path
}: CurvedEdgeRendererProps<E>) {
  const end = useDerivedValue(() => Math.min(1, animationProgress.value));

  const opacity = useDerivedValue(() =>
    focusTransitionProgress.value >= 0
      ? 1
      : 1 + 0.75 * focusTransitionProgress.value
  );

  return (
    <Path
      color={DEFAULT_EDGE_RENDERER_SETTINGS.color}
      end={end}
      opacity={opacity}
      path={path}
      strokeWidth={1}
      style='stroke'
    />
  );
}

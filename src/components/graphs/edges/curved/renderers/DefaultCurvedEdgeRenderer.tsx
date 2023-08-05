import { Path } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { CurvedEdgeRendererProps } from '@/types/renderers';

export default function DefaultCurvedEdgeRenderer<E>({
  animationProgress,
  path
}: CurvedEdgeRendererProps<E>) {
  const end = useDerivedValue(() => Math.min(1, animationProgress.value));

  return (
    <Path
      color={DEFAULT_EDGE_RENDERER_SETTINGS.color}
      end={end}
      path={path}
      strokeWidth={1}
      style='stroke'
    />
  );
}

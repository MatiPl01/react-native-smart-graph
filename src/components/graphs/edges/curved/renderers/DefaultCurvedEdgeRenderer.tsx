import { Path } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { CurvedEdgeRendererProps } from '@/types/renderer';

export default function DefaultCurvedEdgeRenderer<E>({
  path,
  animationProgress
}: CurvedEdgeRendererProps<E>) {
  const end = useDerivedValue(() => Math.min(1, animationProgress.value));

  return (
    <Path
      path={path}
      color={DEFAULT_EDGE_RENDERER_SETTINGS.color}
      style='stroke'
      strokeWidth={1}
      end={end}
    />
  );
}

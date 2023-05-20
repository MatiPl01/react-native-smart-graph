import { Path } from '@shopify/react-native-skia';

import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { CurvedEdgeRendererProps } from '@/types/renderer';

export default function DefaultCurvedEdgeRenderer<E>({
  path
}: CurvedEdgeRendererProps<E>) {
  // TODO - add curve animation
  return (
    <Path
      path={path}
      color={DEFAULT_EDGE_RENDERER_SETTINGS.color}
      style='stroke'
      strokeWidth={1}
    />
  );
}

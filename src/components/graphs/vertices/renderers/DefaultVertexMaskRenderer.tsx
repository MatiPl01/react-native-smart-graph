import { Circle } from '@shopify/react-native-skia';

import { VertexMaskRendererProps } from '@/types/components';

export default function DefaultVertexMaskRenderer({
  r
}: VertexMaskRendererProps) {
  return <Circle r={r} />;
}

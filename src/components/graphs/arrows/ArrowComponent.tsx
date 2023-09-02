import { Group } from '@shopify/react-native-skia';

import { ArrowComponentProps } from '@/types/components';

export default function ArrowComponent({
  animationProgress,
  renderer,
  transform,
  vertexRadius
}: ArrowComponentProps) {
  // RENDERER PROPS
  const rendererProps = {
    animationProgress,
    s: vertexRadius
  };

  return <Group transform={transform}>{renderer(rendererProps)}</Group>;
}

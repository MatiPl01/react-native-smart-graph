import { Group } from '@shopify/react-native-skia';

import { EdgeArrowComponentProps } from '@/types/components';

export default function EdgeArrowComponent({
  animationProgress,
  renderer,
  transform,
  vertexRadius
}: EdgeArrowComponentProps) {
  // RENDERER PROPS
  const rendererProps = {
    animationProgress,
    s: vertexRadius
  };

  return <Group transform={transform}>{renderer(rendererProps)}</Group>;
}

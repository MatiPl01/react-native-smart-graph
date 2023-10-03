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
    customProps: renderer.props,
    s: vertexRadius
  };

  return <Group transform={transform}>{renderer.fn(rendererProps)}</Group>;
}

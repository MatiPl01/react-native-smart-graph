import { useDerivedValue } from 'react-native-reanimated';

import {
  ArrowComponentProps,
  ArrowRenderer,
  ArrowRendererProps
} from '@/types/components';
import { translateAlongVector } from '@/utils/vectors';

export default function ArrowComponent({
  directionVector,
  height,
  renderer,
  tipPosition,
  ...restProps
}: ArrowComponentProps) {
  const centerPosition = useDerivedValue(() =>
    translateAlongVector(
      tipPosition.value,
      directionVector.value,
      height.value / 2
    )
  );

  const rotation = useDerivedValue(() =>
    Math.atan2(directionVector.value.y, directionVector.value.x)
  );

  return (
    <RenderedArrowComponent
      {...restProps}
      centerPosition={centerPosition}
      height={height}
      renderer={renderer}
      rotation={rotation}
      tipPosition={tipPosition}
    />
  );
}

type RenderedArrowComponentProps = ArrowRendererProps & {
  renderer: ArrowRenderer;
};

function RenderedArrowComponent({
  renderer,
  ...rendererProps
}: RenderedArrowComponentProps) {
  return renderer(rendererProps);
}

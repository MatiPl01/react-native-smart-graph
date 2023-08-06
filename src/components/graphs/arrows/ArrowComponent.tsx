import { useDerivedValue } from 'react-native-reanimated';

import { ArrowComponentProps } from '@/types/components';
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

  return renderer({
    ...restProps,
    centerPosition,
    height,
    rotation,
    tipPosition
  });
}

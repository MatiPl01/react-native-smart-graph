import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { AnimatedVector } from '@/types/layout';
import {
  EdgeArrowRenderFunction,
  SharedRenderersProps
} from '@/types/renderer';
import { EdgeArrowSettings } from '@/types/settings';
import { translateAlongVector } from '@/utils/vectors';

type EdgeArrowComponentProps = SharedRenderersProps & {
  directionVector: AnimatedVector;
  tipPosition: AnimatedVector;
  vertexRadius: SharedValue<number>;
  width: SharedValue<number>;
  height: SharedValue<number>;
  renderer: EdgeArrowRenderFunction;
  settings?: EdgeArrowSettings;
};

export default function EdgeArrowComponent({
  directionVector,
  tipPosition,
  height,
  renderer,
  ...restProps
}: EdgeArrowComponentProps) {
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
    tipPosition,
    rotation,
    height
  });
}

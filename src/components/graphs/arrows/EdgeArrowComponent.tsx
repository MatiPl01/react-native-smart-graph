import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { ARROW_COMPONENT_SETTINGS } from '@/constants/components';
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
  vertexRadius: number;
  maxWidth: SharedValue<number>;
  renderer: EdgeArrowRenderFunction;
  settings?: EdgeArrowSettings;
};

export default function EdgeArrowComponent({
  directionVector,
  tipPosition,
  vertexRadius,
  maxWidth,
  renderer,
  settings: userSettings,
  ...restProps
}: EdgeArrowComponentProps) {
  const settings = {
    ...ARROW_COMPONENT_SETTINGS,
    ...userSettings
  };
  const arrowWidth = useDerivedValue(() =>
    Math.min(maxWidth.value, vertexRadius * settings.scale)
  );
  const arrowHeight = useDerivedValue(() => 1.5 * arrowWidth.value);

  const centerPosition = useDerivedValue(() => {
    return translateAlongVector(
      tipPosition.value,
      directionVector.value,
      arrowHeight.value / 2
    );
  });

  const rotation = useDerivedValue(() =>
    Math.atan2(directionVector.value.y, directionVector.value.x)
  );

  return renderer({
    width: arrowWidth,
    height: arrowHeight,
    tipPosition,
    centerPosition,
    rotation,
    ...restProps
  });
}

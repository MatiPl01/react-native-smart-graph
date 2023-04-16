import { useDerivedValue } from 'react-native-reanimated';

import { ARROW_COMPONENT_SETTINGS } from '@/constants/components';
import { AnimatedPosition } from '@/types/layout';
import { EdgeArrowRenderFunction } from '@/types/renderer';
import { EdgeArrowSettings } from '@/types/settings';
import { calcUnitVector, translateAlongVector } from '@/utils/renderer';

type EdgeArrowComponentProps = {
  from: AnimatedPosition;
  to: AnimatedPosition;
  vertexRadius: number;
  renderer: EdgeArrowRenderFunction;
  settings?: EdgeArrowSettings;
};

export default function EdgeArrowComponent({
  from,
  to,
  vertexRadius,
  renderer,
  settings: userSettings
}: EdgeArrowComponentProps) {
  const settings = {
    ...ARROW_COMPONENT_SETTINGS,
    ...userSettings
  };
  const arrowSize = 2 * vertexRadius * settings.scale;

  const dirVec = useDerivedValue(
    () => calcUnitVector(to.value, from.value),
    [to, from]
  );

  const tipPosition = useDerivedValue(
    () => translateAlongVector(to.value, dirVec.value, vertexRadius),
    [to, dirVec]
  );

  const centerPosition = useDerivedValue(() => {
    return translateAlongVector(tipPosition.value, dirVec.value, arrowSize / 2);
  }, [tipPosition, dirVec]);

  const rotation = useDerivedValue(
    () => Math.atan2(dirVec.value.y, dirVec.value.x),
    [dirVec]
  );

  return renderer({
    size: arrowSize,
    vertexPosition: to,
    tipPosition,
    centerPosition,
    rotation
  });
}

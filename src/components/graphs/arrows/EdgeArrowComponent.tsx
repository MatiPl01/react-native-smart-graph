import { useDerivedValue } from 'react-native-reanimated';

import { ARROW_COMPONENT_SETTINGS } from '@/constants/components';
import { AnimatedVector } from '@/types/layout';
import {
  EdgeArrowRenderFunction,
  SharedRenderersProps
} from '@/types/renderer';
import { EdgeArrowSettings } from '@/types/settings';
import {
  calcUnitVector,
  distanceBetweenVectors,
  translateAlongVector
} from '@/utils/vectors';

type EdgeArrowComponentProps = SharedRenderersProps & {
  from: AnimatedVector;
  to: AnimatedVector;
  vertexRadius: number;
  renderer: EdgeArrowRenderFunction;
  settings?: EdgeArrowSettings;
};

export default function EdgeArrowComponent({
  from,
  to,
  vertexRadius,
  renderer,
  settings: userSettings,
  ...restProps
}: EdgeArrowComponentProps) {
  const settings = {
    ...ARROW_COMPONENT_SETTINGS,
    ...userSettings
  };
  const arrowSize = useDerivedValue(() =>
    Math.min(
      2 * vertexRadius * settings.scale,
      0.35 * distanceBetweenVectors(from.value, to.value)
    )
  );

  const dirVec = useDerivedValue(() => calcUnitVector(to.value, from.value));

  const tipPosition = useDerivedValue(() =>
    translateAlongVector(to.value, dirVec.value, vertexRadius)
  );

  const centerPosition = useDerivedValue(() => {
    return translateAlongVector(
      tipPosition.value,
      dirVec.value,
      arrowSize.value / 2
    );
  });

  const rotation = useDerivedValue(() =>
    Math.atan2(dirVec.value.y, dirVec.value.x)
  );

  return renderer({
    size: arrowSize,
    vertexPosition: to,
    tipPosition,
    centerPosition,
    rotation,
    ...restProps
  });
}

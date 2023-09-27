/* eslint-disable @typescript-eslint/no-explicit-any */
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

import { VertexComponentData } from '@/types/data';
import { Unsharedify } from '@/types/utils';
import { unsharedify } from '@/utils/objects';
import { calcValueOnProgress } from '@/utils/views';

type ReactionProps = Pick<
  VertexComponentData<unknown>,
  'points' | 'scale' | 'transformProgress'
>;

type CustomReactionProps<S> = ReactionProps & {
  customProps: Unsharedify<S>;
  transform: {
    scale: number;
    x: number;
    y: number;
  };
};

export function useVertexTransform<
  P extends VertexComponentData<any>,
  S extends Record<string, SharedValue<any>>
>(
  inputProps: P,
  additional?: [(props: P) => S, (props: CustomReactionProps<S>) => void]
) {
  const { points, scale, transformProgress } = inputProps;
  // ADDITIONAL PROPS
  const [selector, reaction] = additional ?? [];
  const additionalProps = selector?.(inputProps);

  return useDerivedValue(() => {
    const s = Math.max(0, scale.value);
    const progress = transformProgress.value;
    const { source, target } = points.value;

    const customProps = unsharedify(additionalProps);

    const x = calcValueOnProgress(progress, source.x, target.x) / s;
    const y = calcValueOnProgress(progress, source.y, target.y) / s;

    reaction?.({
      customProps,
      points,
      scale,
      transform: { scale: s, x, y },
      transformProgress
    });

    return [
      { scale: s },
      ...(s > 0 ? [{ translateX: x }, { translateY: y }] : [])
    ];
  });
}

import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { Vertices } from '@shopify/react-native-skia';

import { EdgeArrowRendererProps } from '@/types/render';
import {
  areDirectedEdgeRendererProps,
  calcOrthogonalVector,
  calcUnitVector,
  translateAlongVector
} from '@/utils/renderer';

export default function DefaultEdgeArrowRenderer<E>(
  props: EdgeArrowRendererProps<E>
) {
  if (!areDirectedEdgeRendererProps(props)) {
    throw new Error('Arrow renderer can only be used with directed edges');
  }

  const { from, to, vertexRadius } = props;

  const vertices = useDerivedValue(() => {
    const dirVec = calcUnitVector(to.value, from.value);

    const p1 = translateAlongVector(to.value, dirVec, vertexRadius);

    const height = 0.75 * vertexRadius;
    const helperPoint = translateAlongVector(p1, dirVec, height);
    const orthogonalDirVec = calcOrthogonalVector(dirVec);

    const p2 = translateAlongVector(helperPoint, orthogonalDirVec, height / 2);
    const p3 = translateAlongVector(helperPoint, orthogonalDirVec, -height / 2);

    return [p1, p2, p3];
  }, [to]);
  const colors = ['#777', '#777', '#777'];

  return <Vertices vertices={vertices} colors={colors} />;
}

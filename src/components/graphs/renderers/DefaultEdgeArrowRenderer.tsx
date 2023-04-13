import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { Vertices } from '@shopify/react-native-skia';

import { EdgeRendererProps } from '@/types/render';
import { areDirectedEdgeRendererProps } from '@/utils/renderer';

// TODO - move to utils
const calcUnitVector = (
  from: { x: number; y: number },
  to: { x: number; y: number }
): { x: number; y: number } => {
  'worklet';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mag = Math.sqrt(dx ** 2 + dy ** 2);

  return { x: dx / mag, y: dy / mag };
};

const translateByVector = (
  point: { x: number; y: number },
  vector: { x: number; y: number }
): { x: number; y: number } => {
  'worklet';
  return { x: point.x + vector.x, y: point.y + vector.y };
};

// TODO - add vertex size or some other relative size in props
export default function DefaultEdgeArrowRenderer<
  E,
  R extends EdgeRendererProps<E>
>(props: R) {
  if (!areDirectedEdgeRendererProps(props)) {
    throw new Error('Arrow renderer can only be used with directed edges');
  }

  const { from, to } = props;

  // TODO fix arrows rotation and size
  const vertices = useDerivedValue(() => {
    const dirVec = calcUnitVector(from.value, to.value);
    const helperPoint = translateByVector(to.value, dirVec);

    const p1 = to.value;
    const p2 = { x: helperPoint.x - 50, y: helperPoint.y - 50 };
    const p3 = { x: helperPoint.x - 50, y: helperPoint.y + 50 };

    return [p1, p2, p3];
  }, [to]);
  const colors = ['#333', '#333', '#333'];

  return <Vertices vertices={vertices} colors={colors} />;
}

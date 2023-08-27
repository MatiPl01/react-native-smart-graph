/* eslint-disable import/no-unused-modules */
import { Vector } from '@shopify/react-native-skia';

import { EdgeComponentData, LabelComponentData } from '@/types/data';
import { Unsharedify } from '@/types/utils';
import {
  addVectors,
  calcOrthogonalVector,
  calcUnitVector,
  getLineCenter,
  multiplyVector
} from '@/utils/vectors';
import { calcTranslationOnProgress, calcValueOnProgress } from '@/utils/views';

type Props = {
  label: {
    displayed: boolean;
    scale: number;
  };
  offsetFactor: number;
  points: Unsharedify<EdgeComponentData<unknown>['points']>;
  progress: number;
  r: number;
};

type EdgeTranslation = {
  offset: number;
  p1: Vector;
  p2: Vector;
  v1: Vector;
  v2: Vector;
};

export type TranslationOffsetGetter = (
  order: number,
  edgesCount: number,
  maxOffsetFactor: number,
  vertexRadius: number
) => number;

export const getEdgeTranslation = (
  calcTranslationOffset: TranslationOffsetGetter,
  startOffset: number,
  {
    target: { edgesCount, order }
  }: Unsharedify<EdgeComponentData<unknown>['ordering']>,
  {
    offsetFactor,
    points: { v1Source, v1Target, v2Source, v2Target },
    progress,
    r
  }: Props
): EdgeTranslation => {
  'worklet';
  const v1 = calcTranslationOnProgress(progress, v1Source, v1Target);
  const v2 = calcTranslationOnProgress(progress, v2Source, v2Target);
  const directionVector = calcUnitVector(v2, v1);
  const targetOffset = calcTranslationOffset(
    order,
    edgesCount,
    offsetFactor,
    r
  );
  const offset = calcValueOnProgress(progress, startOffset, targetOffset);
  const translationDirection = calcOrthogonalVector(directionVector);
  const translationVector = multiplyVector(translationDirection, offset);

  return {
    offset,
    p1: addVectors(v1, translationVector),
    p2: addVectors(v2, translationVector),
    v1,
    v2
  };
};

export const getLabelTransform = <E>(
  { p1, p2, v1, v2 }: EdgeTranslation,
  startScale: number,
  {
    target: { edgesCount }
  }: Unsharedify<EdgeComponentData<unknown>['ordering']>,
  { label, offsetFactor, progress }: Props
): Unsharedify<LabelComponentData<E>['transform']> => {
  'worklet';
  const targetScale = Math.min(
    (2 * offsetFactor) / (edgesCount > 0 ? edgesCount - 1 : 1),
    label.scale
  );

  return {
    center: getLineCenter(p1, p2),
    p1: v1,
    p2: v2,
    scale: calcValueOnProgress(progress, startScale, targetScale)
  };
};

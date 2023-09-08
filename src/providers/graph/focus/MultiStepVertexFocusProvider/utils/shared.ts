/* eslint-disable import/no-unused-modules */
import {
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint
} from '@/types/data';
import { binarySearchLE } from '@/utils/algorithms';

export const createPointMapping = <V>(
  sourcePoint: MappingSourcePoint,
  targetStep: FocusStepData<V>
): FocusPointMapping<V> => {
  'worklet';
  return {
    from: sourcePoint,
    to: targetStep
  };
};

export const findPrevStepIdx = <V>(
  steps: Array<FocusStepData<V> | MappingSourcePoint>,
  progress: number
): number => {
  'worklet';
  return binarySearchLE(steps, progress, step => step.startsAt);
};

export const getIndicesOfFocusProgressClosestPoints = <V>(
  points: Array<FocusStepData<V>> | Array<MappingSourcePoint>,
  focusProgress: number
): {
  nextIdx: number;
  prevIdx: number;
} => {
  'worklet';
  const prevIdx = Math.max(findPrevStepIdx(points, focusProgress), 0);
  const nextIdx = Math.min(prevIdx + 1, points.length - 1);
  return {
    nextIdx,
    prevIdx
  };
};

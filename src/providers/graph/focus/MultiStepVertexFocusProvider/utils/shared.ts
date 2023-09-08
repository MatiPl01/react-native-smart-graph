/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

export const createMappings = <V>(
  createMappingsFn: (
    sourcePoints: Array<MappingSourcePoint>,
    targetStepsData: Array<FocusStepData<V>> // must be sorted
  ) => Array<FocusPointMapping<V>>,
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>>,
  prevSourcePointIdx: number,
  nextSourcePointIdx: number,
  prevTargetStepIdx: number,
  nextTargetStepIdx: number
): Array<FocusPointMapping<V>> => {
  'worklet';
  // Create mappings
  const mappings: Array<FocusPointMapping<V>> = [];
  // Add mapping for points balow source points
  mappings.push(
    ...createMappingsFn(
      sourcePoints.slice(0, prevSourcePointIdx),
      targetStepsData.slice(0, prevTargetStepIdx)
    )
  );
  // Add mapping for source points
  mappings.push(
    createPointMapping(
      sourcePoints[prevSourcePointIdx]!,
      targetStepsData[prevTargetStepIdx]!
    )
  );
  if (prevTargetStepIdx !== nextTargetStepIdx) {
    createPointMapping(
      sourcePoints[nextSourcePointIdx]!,
      targetStepsData[nextTargetStepIdx]!
    );
  }
  // Add mapping for points above source points
  mappings.push(
    ...createMappingsFn(
      sourcePoints.slice(nextSourcePointIdx + 1),
      targetStepsData.slice(nextTargetStepIdx + 1)
    )
  );
  return mappings;
};

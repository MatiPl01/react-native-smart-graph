/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FocusConfig,
  FocusPath,
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint
} from '@/types/data';
import { getMultiStepVertexTransformation } from '@/utils/focus';
import { calcTransformationOnProgress } from '@/utils/views';

import {
  createMappings,
  findPrevStepIdx,
  getIndicesOfFocusProgressClosestPoints,
  getMappingSourcePoints
} from './shared';

const expandMappingFromEmptySource = <V>(
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number,
  focusConfig: FocusConfig
): Array<FocusPointMapping<V>> => {
  'worklet';
  const closest = getIndicesOfFocusProgressClosestPoints(
    targetStepsData,
    focusProgress
  );
  // Get the current focus point position as the initial point
  const prevStepTransformation = getMultiStepVertexTransformation(
    targetStepsData[closest.prevIdx]!,
    focusConfig
  );
  const nextStepTransformation = getMultiStepVertexTransformation(
    targetStepsData[closest.nextIdx]!,
    focusConfig
  );
  const initialPointTransformation = calcTransformationOnProgress(
    focusProgress,
    prevStepTransformation,
    nextStepTransformation
  );

  return targetStepsData.map(step => ({
    from: {
      // Slide from top (1 above the current progress to ensure that
      // the transition will be smooth)
      startsAt: step.startsAt + focusProgress + 1,
      transform: initialPointTransformation
    },
    to: step
  }));
};

const createExpandedMapping = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>> // must be sorted
): Array<FocusPointMapping<V>> => {
  'worklet';
  if (!sourcePoints.length || !targetStepsData.length) return [];

  const result: Array<FocusPointMapping<V>> = [];

  let nextTargetIdx = 1;

  for (let sourceIdx = 0; sourceIdx < sourcePoints.length; sourceIdx++) {
    const sourcePoint = sourcePoints[sourceIdx]!;
    const remainingSourcePointsCount = sourcePoints.length - sourceIdx;
    const maxNextTargetIdx =
      targetStepsData.length - remainingSourcePointsCount;
    let minDifference = Math.abs(
      sourcePoint.startsAt - targetStepsData[nextTargetIdx - 1]!.startsAt
    );

    console.log({
      maxNextTargetIdx,
      nextTargetIdx,
      sourceIdx
    });

    while (nextTargetIdx <= maxNextTargetIdx) {
      const difference =
        nextTargetIdx === maxNextTargetIdx // Assign Infinity if there are no more target steps
          ? Infinity
          : Math.abs(
              sourcePoint.startsAt - targetStepsData[nextTargetIdx]!.startsAt
            );
      // If the difference is greater than the previous one, we found the closest target step
      // (the previous one)
      if (difference === Infinity || difference > minDifference) {
        break;
      }
      minDifference = difference;
      nextTargetIdx++;
    }

    // Add mappings for all skipped target steps and the closest target step
    // or for all remaining target steps if there are no more source points
    for (
      let i = result.length;
      i <
      (sourceIdx === sourcePoints.length - 1
        ? targetStepsData.length
        : nextTargetIdx);
      i++
    ) {
      // Check if the previous source points is closer to the current target step
      // (only if this is not the last target step)
      const prevSourcePoint = sourcePoints[sourceIdx - 1];
      const targetStep = targetStepsData[i]!;
      if (
        i < targetStepsData.length - 1 &&
        prevSourcePoint &&
        Math.abs(prevSourcePoint.startsAt - targetStep.startsAt) <
          Math.abs(sourcePoint.startsAt - targetStep.startsAt)
      ) {
        result.push({ from: prevSourcePoint, to: targetStep });
      } else {
        result.push({ from: sourcePoint, to: targetStep });
      }
    }

    nextTargetIdx++;
  }

  return result;
};

const expandMappingFromNonEmptySource = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number
): Array<FocusPointMapping<V>> => {
  'worklet';
  console.log('expandMappingFromNonEmptySource');
  const prevSourceIdx = findPrevStepIdx(sourcePoints, focusProgress);
  let prevTargetIdx = findPrevStepIdx(targetStepsData, focusProgress);

  // Ensure that there are no points left above and below source points
  if (prevSourceIdx > prevTargetIdx) {
    prevTargetIdx = prevSourceIdx;
  } else {
    const remainingSourcePointsCount = sourcePoints.length - prevSourceIdx;
    const remainingTargetStepsCount = targetStepsData.length - prevTargetIdx;
    if (remainingSourcePointsCount > remainingTargetStepsCount) {
      prevTargetIdx = targetStepsData.length - remainingSourcePointsCount;
    }
  }

  const nextSourceIdx = Math.min(prevSourceIdx + 1, sourcePoints.length - 1);
  const nextTargetIdx = prevTargetIdx + 1; // Can exceed the array length

  return createMappings(
    createExpandedMapping,
    sourcePoints,
    targetStepsData,
    prevSourceIdx,
    nextSourceIdx,
    prevTargetIdx,
    nextTargetIdx
  );
};

export const expandPointsMapping = <V>(
  oldPath: FocusPath<V>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  transitionProgress: number,
  focusProgress: number,
  focusConfig: FocusConfig
): Array<FocusPointMapping<V>> => {
  'worklet';
  console.log('expand');
  if (!targetStepsData.length) return [];

  // Case 1: Transition from empty path
  if (!oldPath.points.length) {
    return expandMappingFromEmptySource(
      targetStepsData,
      focusProgress,
      focusConfig
    );
  }
  // Case 2: Transition from non-empty path
  const sourcePoints = getMappingSourcePoints(
    oldPath.points,
    transitionProgress,
    focusConfig
  );
  return expandMappingFromNonEmptySource(
    sourcePoints,
    targetStepsData,
    focusProgress
  );
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint
} from '@/types/data';

import {
  createMappings,
  getIndicesOfFocusProgressClosestPoints
} from './shared';

const shrinkMappingToEmptyTarget = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>> // must be sorted
): Array<FocusPointMapping<V>> => {
  'worklet';
  return targetStepsData.map((step, idx) => ({
    from: sourcePoints[idx]!,
    to: {
      ...step,
      startsAt: step.startsAt + 1 // Slide to top
    }
  }));
};

const createShrunkMapping = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>> // must be sorted
): Array<FocusPointMapping<V>> => {
  'worklet';
  const result: Array<FocusPointMapping<V>> = [];

  let nextSourceIdx = 1;

  for (let targetIdx = 0; targetIdx < targetStepsData.length; targetIdx++) {
    const targetStep = targetStepsData[targetIdx]!;
    const remainingTargetStepsCount = targetStepsData.length - targetIdx;
    const maxNextSourceIdx = sourcePoints.length - remainingTargetStepsCount;
    let minDifference = Math.abs(
      targetStep.startsAt - sourcePoints[nextSourceIdx - 1]!.startsAt
    );

    while (nextSourceIdx <= maxNextSourceIdx) {
      const difference =
        nextSourceIdx === maxNextSourceIdx // Assign Infinity if there are no more source points
          ? Infinity
          : Math.abs(
              targetStep.startsAt - sourcePoints[nextSourceIdx]!.startsAt
            );
      // If the difference is smaller than the previous one, we found the closest source point
      // (the previous one)
      if (difference === Infinity || difference > minDifference) {
        // Add mappings for all skipped source points and the closest source point
        for (let i = result.length; i < nextSourceIdx; i++) {
          // Check if the previous target step is closer to the current source point
          const prevTargetStep = targetStepsData[targetIdx - 1];
          const sourcePoint = sourcePoints[i]!;
          if (
            prevTargetStep &&
            Math.abs(prevTargetStep.startsAt - sourcePoint.startsAt) <
              Math.abs(targetStep.startsAt - sourcePoint.startsAt)
          ) {
            result.push({ from: sourcePoint, to: prevTargetStep });
          } else {
            result.push({ from: sourcePoint, to: targetStep });
          }
        }
        minDifference = Infinity;
        nextSourceIdx++;
        continue;
      }
      minDifference = difference;
      nextSourceIdx++;
    }
  }

  return result;
};

const shrinkMappingToNonEmptyTarget = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number
): Array<FocusPointMapping<V>> => {
  'worklet';
  const { nextIdx: nextTargetStepIdx, prevIdx: prevTargetStepIdx } =
    getIndicesOfFocusProgressClosestPoints(targetStepsData, focusProgress);
  let { nextIdx: nextSourcePointIdx, prevIdx: prevSourcePointIdx } =
    getIndicesOfFocusProgressClosestPoints(targetStepsData, focusProgress);

  // Ensure that there are no points left above and below target points
  if (prevTargetStepIdx > prevSourcePointIdx) {
    prevSourcePointIdx = prevTargetStepIdx;
    nextSourcePointIdx = nextTargetStepIdx;
  } else {
    const remainingSourcePointsCount = sourcePoints.length - nextSourcePointIdx;
    const remainingTargetStepsCount =
      targetStepsData.length - nextTargetStepIdx;
    if (remainingTargetStepsCount > remainingSourcePointsCount) {
      nextSourcePointIdx = sourcePoints.length - remainingTargetStepsCount;
      prevSourcePointIdx =
        sourcePoints.length - (targetStepsData.length - prevTargetStepIdx);
    }
  }

  return createMappings(
    createShrunkMapping,
    sourcePoints,
    targetStepsData,
    prevSourcePointIdx,
    nextSourcePointIdx,
    prevTargetStepIdx,
    nextTargetStepIdx
  );
};

export const shrinkPointsMapping = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number
): Array<FocusPointMapping<V>> => {
  'worklet';
  if (!sourcePoints.length) return [];

  // Case 1: Transition to empty path
  if (!targetStepsData.length) {
    return shrinkMappingToEmptyTarget(sourcePoints, targetStepsData);
  }
  // Case 2: Transition to non-empty path
  return shrinkMappingToNonEmptyTarget(
    sourcePoints,
    targetStepsData,
    focusProgress
  );
};

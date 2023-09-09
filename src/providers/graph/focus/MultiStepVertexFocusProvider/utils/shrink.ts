/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FocusConfig,
  FocusPath,
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint
} from '@/types/data';

import {
  createMappings,
  findPrevStepIdx,
  getMappingSourcePoints
} from './shared';

const shrinkMappingToEmptyTarget = <V>(
  oldPath: FocusPath<V>,
  focusProgress: number,
  sourcePoints: Array<MappingSourcePoint>
): Array<FocusPointMapping<V>> => {
  'worklet';

  return sourcePoints.map((point, idx) => {
    const step = oldPath.points[idx]!.to;
    return {
      from: point,
      to: {
        ...step,
        // Slide to top (slightly above the top to ensure that this point
        // will be removed from the path on the path cleanup)
        startsAt: step.startsAt + focusProgress + 1.01
      }
    };
  });
};

const createShrunkMapping = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>> // must be sorted
): Array<FocusPointMapping<V>> => {
  'worklet';
  if (!sourcePoints.length || !targetStepsData.length) return [];

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
        break;
      }
      minDifference = difference;
      nextSourceIdx++;
    }

    // Add mappings for all skipped source points and the closest source point
    // or for all remaining source points if there are no more target steps
    for (
      let i = result.length;
      i <
      (targetIdx === targetStepsData.length - 1
        ? sourcePoints.length
        : nextSourceIdx);
      i++
    ) {
      // Check if the previous target step is closer to the current source point
      // (only if this is not the last source point)
      const prevTargetStep = targetStepsData[targetIdx - 1];
      const sourcePoint = sourcePoints[i]!;
      if (
        i < sourcePoints.length - 1 &&
        prevTargetStep &&
        Math.abs(prevTargetStep.startsAt - sourcePoint.startsAt) <
          Math.abs(targetStep.startsAt - sourcePoint.startsAt)
      ) {
        result.push({ from: sourcePoint, to: prevTargetStep });
      } else {
        result.push({ from: sourcePoint, to: targetStep });
      }
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
  let prevSourceIdx = findPrevStepIdx(sourcePoints, focusProgress);
  const prevTargetIdx = findPrevStepIdx(targetStepsData, focusProgress);

  // Ensure that there are no points left above and below target points
  if (prevTargetIdx > prevSourceIdx) {
    prevSourceIdx = prevTargetIdx;
  } else {
    const remainingSourcePointsCount = sourcePoints.length - prevSourceIdx;
    const remainingTargetStepsCount = targetStepsData.length - prevTargetIdx;
    if (remainingTargetStepsCount > remainingSourcePointsCount) {
      prevSourceIdx = sourcePoints.length - remainingTargetStepsCount;
    }
  }

  const nextSourceIdx = prevSourceIdx + 1; // Can exceed the array length
  const nextTargetIdx = Math.min(prevTargetIdx + 1, targetStepsData.length - 1);

  return createMappings(
    createShrunkMapping,
    sourcePoints,
    targetStepsData,
    prevSourceIdx,
    nextSourceIdx,
    prevTargetIdx,
    nextTargetIdx
  );
};

export const shrinkPointsMapping = <V>(
  oldPath: FocusPath<V>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number,
  transitionProgress: number,
  focusConfig: FocusConfig
): Array<FocusPointMapping<V>> => {
  'worklet';
  if (!oldPath.points.length) return [];

  const sourcePoints = getMappingSourcePoints(
    oldPath.points,
    transitionProgress,
    focusConfig
  );

  // Case 1: Transition to empty path
  if (!targetStepsData.length) {
    return shrinkMappingToEmptyTarget(oldPath, focusProgress, sourcePoints);
  }
  // Case 2: Transition to non-empty path
  return shrinkMappingToNonEmptyTarget(
    sourcePoints,
    targetStepsData,
    focusProgress
  );
};

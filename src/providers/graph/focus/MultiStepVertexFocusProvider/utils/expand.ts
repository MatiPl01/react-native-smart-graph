/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FocusConfig,
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint
} from '@/types/data';
import { getMultiStepVertexTransformation } from '@/utils/focus';
import { calcTransformationOnProgress } from '@/utils/views';

import {
  createPointMapping,
  getIndicesOfFocusProgressClosestPoints
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
      startsAt: step.startsAt + 1, // Slide from top
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
  const result: Array<FocusPointMapping<V>> = [];

  let nextTargetIdx = 1;

  for (let sourceIdx = 0; sourceIdx < sourcePoints.length; sourceIdx++) {
    const sourcePoint = sourcePoints[sourceIdx]!;
    const remainingSourcePointsCount = sourcePoints.length - sourceIdx;
    const maxNextTargetIdx = nextTargetIdx + remainingSourcePointsCount;
    let minDifference = Math.abs(
      sourcePoint.startsAt - targetStepsData[nextTargetIdx - 1]!.startsAt
    );

    while (nextTargetIdx <= maxNextTargetIdx) {
      const difference =
        nextTargetIdx === maxNextTargetIdx // Assign Infinity if there are no more target steps
          ? Infinity
          : Math.abs(
              sourcePoint.startsAt - targetStepsData[nextTargetIdx]!.startsAt
            );
      // If the difference is greater than the previous one, we found the closest target step
      // (the previous one)
      if (difference > minDifference) {
        // Add mappings for all skipped target steps and the closest target step
        for (let i = result.length; i < nextTargetIdx; i++) {
          // Check if the previous source points is closer to the current target step
          const prevSourcePoint = sourcePoints[sourceIdx - 1];
          const targetStep = targetStepsData[i]!;
          if (
            prevSourcePoint &&
            Math.abs(prevSourcePoint.startsAt - targetStep.startsAt) <
              Math.abs(sourcePoint.startsAt - targetStep.startsAt)
          ) {
            result.push({ from: prevSourcePoint, to: targetStep });
          } else {
            result.push({ from: sourcePoint, to: targetStep });
          }
        }
        continue;
      }
      minDifference = difference;
      nextTargetIdx++;
    }
  }

  return result;
};

const expandMappingFromNonEmptySource = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number
): Array<FocusPointMapping<V>> => {
  let { nextIdx: nextTargetStepIdx, prevIdx: prevTargetStepIdx } =
    getIndicesOfFocusProgressClosestPoints(targetStepsData, focusProgress);
  const { nextIdx: nextSourcePointIdx, prevIdx: prevSourcePointIdx } =
    getIndicesOfFocusProgressClosestPoints(targetStepsData, focusProgress);

  // Ensure that there are no points left above and below source points
  if (prevSourcePointIdx > prevTargetStepIdx) {
    prevTargetStepIdx = prevSourcePointIdx;
    nextTargetStepIdx = nextSourcePointIdx;
  } else {
    const remainingSourcePointsCount = sourcePoints.length - nextSourcePointIdx;
    const remainingTargetStepsCount =
      targetStepsData.length - nextTargetStepIdx;
    if (remainingSourcePointsCount > remainingTargetStepsCount) {
      nextTargetStepIdx = targetStepsData.length - remainingSourcePointsCount;
      prevTargetStepIdx =
        targetStepsData.length - (sourcePoints.length - prevSourcePointIdx);
    }
  }

  // Create mappings
  const mappings: Array<FocusPointMapping<V>> = [];
  // Add mapping for points balow source points
  mappings.push(
    ...createExpandedMapping(
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
    ...createExpandedMapping(
      sourcePoints.slice(nextSourcePointIdx + 1),
      targetStepsData.slice(nextTargetStepIdx + 1)
    )
  );

  return mappings;
};

export const expandPointsMapping = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number,
  focusConfig: FocusConfig
): Array<FocusPointMapping<V>> => {
  'worklet';
  if (!targetStepsData.length) return [];

  // Case 1: Transition from empty path
  if (!sourcePoints.length) {
    return expandMappingFromEmptySource(
      targetStepsData,
      focusProgress,
      focusConfig
    );
  }
  // Case 2: Transition from non-empty path
  return expandMappingFromNonEmptySource(
    sourcePoints,
    targetStepsData,
    focusProgress
  );
};

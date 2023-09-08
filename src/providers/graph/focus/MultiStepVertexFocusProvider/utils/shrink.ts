/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint
} from '@/types/data';

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

const shrinkMappingToNonEmptyTarget = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number
): Array<FocusPointMapping<V>> => {
  'worklet';
};

export const shrinkPointsMapping = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  focusProgress: number
): Array<FocusPointMapping<V>> => {
  ('worklet');
  if (!sourcePoints.length) return [];

  // Case 1: Transition to empty path
  if (!targetStepsData.length) {
    return shrinkMappingToEmptyTarget(sourcePoints, targetStepsData);
  }
};

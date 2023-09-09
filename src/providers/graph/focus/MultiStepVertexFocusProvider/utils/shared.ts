/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FocusConfig,
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint
} from '@/types/data';
import { binarySearchLE } from '@/utils/algorithms';
import { getMultiStepVertexTransformation } from '@/utils/focus';
import {
  calcTransformationOnProgress,
  calcValueOnProgress
} from '@/utils/views';

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
  prevSourceIdx: number,
  nextSourceIdx: number,
  prevTargetIdx: number,
  nextTargetIdx: number
): Array<FocusPointMapping<V>> => {
  'worklet';
  console.log('createMappings', {
    nextSourceIdx,
    nextTargetIdx,
    prevSourceIdx,
    prevTargetIdx
  });
  // Create mappings
  const mappings: Array<FocusPointMapping<V>> = [];
  // Add mapping for points balow source points
  // including the lower source point
  mappings.push(
    ...createMappingsFn(
      sourcePoints.slice(0, prevSourceIdx + 1),
      targetStepsData.slice(0, prevTargetIdx + 1)
    )
  );
  // Add mapping for points above source points
  mappings.push(
    ...createMappingsFn(
      sourcePoints.slice(nextSourceIdx),
      targetStepsData.slice(nextTargetIdx)
    )
  );
  return mappings;
};

export const getMappingSourcePoints = <V>(
  oldPointsMapping: Array<FocusPointMapping<V>>,
  transitionProgress: number,
  focusConfig: FocusConfig
): Array<MappingSourcePoint> => {
  'worklet';
  return oldPointsMapping.map(({ from, to }) => {
    const sourceTransform = from.transform;
    const targetTransform = getMultiStepVertexTransformation(to, focusConfig);

    return {
      startsAt: calcValueOnProgress(
        transitionProgress,
        from.startsAt,
        to.startsAt
      ),
      transform: calcTransformationOnProgress(
        transitionProgress,
        sourceTransform,
        targetTransform
      )
    };
  });
};

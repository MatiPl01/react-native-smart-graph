/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FocusConfig,
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint,
  TransformedFocusPoint,
  VertexTransformation
} from '@/types/data';
import { binarySearchLE } from '@/utils/algorithms';
import { getFocusedVertexTransformation } from '@/utils/focus';
import { getVertexTransformation } from '@/utils/transform';
import {
  calcTransformationOnProgress,
  calcValueOnProgress
} from '@/utils/views';

export const findPrevStepIdx = <V>(
  steps: Array<FocusStepData<V> | MappingSourcePoint>,
  progress: number
): number => {
  'worklet';
  return Math.max(
    binarySearchLE(steps, progress, step => step.startsAt),
    0
  );
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

const getFocusPointTransformation = <V>(
  mapping: FocusPointMapping<V>,
  focusConfig: FocusConfig,
  progress = 1
): VertexTransformation => {
  'worklet';
  const { from, to } = mapping;
  return calcTransformationOnProgress(
    progress,
    from.transform,
    getFocusedVertexTransformation(
      to.point.alignment,
      focusConfig.canvasDimensions,
      getVertexTransformation(to.vertex, to.point.vertexScale),
      focusConfig.vertexRadius
    )
  );
};

export const getTransformedFocusPoint = <V>(
  mapping: FocusPointMapping<V>,
  id: number,
  focusConfig: FocusConfig,
  progress = 1
): TransformedFocusPoint => {
  'worklet';
  return {
    id,
    key: mapping.to.point.key,
    startsAt: calcValueOnProgress(
      progress,
      mapping.from.startsAt,
      mapping.to.startsAt
    ),
    transform: getFocusPointTransformation(mapping, focusConfig, progress)
  };
};

export const getMappingSourcePoints = <V>(
  oldPointsMapping: Array<FocusPointMapping<V>>,
  transitionProgress: number,
  focusConfig: FocusConfig
): Array<MappingSourcePoint> => {
  'worklet';
  return oldPointsMapping.map((mapping, idx) =>
    getTransformedFocusPoint(mapping, idx, focusConfig, transitionProgress)
  );
};

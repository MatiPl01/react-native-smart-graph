/* eslint-disable import/no-unused-modules */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SharedValue, withTiming } from 'react-native-reanimated';

import {
  FocusBoundsMapping,
  FocusConfig,
  FocusPath,
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint,
  VertexComponentData
} from '@/types/data';
import { AllAnimationSettings, UpdatedFocusPoint } from '@/types/settings';
import {
  getMultiStepVertexTransformation,
  updateFocusTransformation
} from '@/utils/focus';
import { animatedCanvasDimensionsToDimensions } from '@/utils/placement';
import { calcTranslationOnProgress, calcValueOnProgress } from '@/utils/views';

import { StateProps } from './types';

export const getTargetPoint = <V>({
  afterStep,
  beforeStep,
  currentProgress,
  previousProgress,
  targetPoint: { value: prevTargetPoint }
}: StateProps<V>): UpdatedFocusPoint | null => {
  'worklet';
  if (currentProgress < previousProgress) {
    return beforeStep ?? null;
  } else if (currentProgress > previousProgress) {
    return afterStep ?? null;
  }
  if (
    beforeStep &&
    (beforeStep.startsAt === prevTargetPoint?.startsAt || !prevTargetPoint) &&
    currentProgress > beforeStep.startsAt
  ) {
    return afterStep ?? null;
  }
  if (
    afterStep &&
    (afterStep.startsAt === prevTargetPoint?.startsAt || !prevTargetPoint) &&
    currentProgress < afterStep.startsAt
  ) {
    return beforeStep ?? null;
  }
  return prevTargetPoint;
};

export const getResultingProgress = <V>(
  targetStep: FocusStepData<V> | null,
  { afterStep, beforeStep, currentProgress, syncProgress }: StateProps<V>
): number => {
  'worklet';
  const afterProgress = afterStep?.startsAt ?? 1;
  const beforeProgress = beforeStep?.startsAt ?? 0;

  const stepProgress =
    (targetStep === afterStep
      ? currentProgress - beforeProgress
      : afterProgress - currentProgress) /
    (afterProgress - beforeProgress);

  return stepProgress * syncProgress;
};

export const getTransitionBounds = <V>({
  afterStep,
  beforeStep,
  syncProgress,
  targetPoint: { value: targetPoint }
}: StateProps<V>): {
  source: FocusStepData<V> | null;
  target: FocusStepData<V> | null;
} => {
  'worklet';
  let targetStep: FocusStepData<V> | null = null;
  let sourceStep: FocusStepData<V> | null = null;

  if (targetPoint?.startsAt === beforeStep?.startsAt) {
    targetStep = beforeStep;
    sourceStep = afterStep;
  } else if (targetPoint?.startsAt === afterStep?.startsAt) {
    targetStep = afterStep;
    sourceStep = beforeStep;
  } else if (!targetPoint) {
    // For blur transition
    sourceStep = beforeStep ?? afterStep;
  }

  if (syncProgress < 1) {
    sourceStep = null;
  }

  return {
    source: sourceStep,
    target: targetStep
  };
};

export const updateTransitionPoints = <V>(
  props: StateProps<V>
): {
  endUpdated?: boolean;
  startUpdated?: boolean;
} => {
  'worklet';
  const { focusContext, vertexRadius, viewDataContext } = props;
  const { source: sourceStep, target: targetStep } = getTransitionBounds(props);

  const transformationConfig = {
    availableScales: viewDataContext.scales.value,
    canvasDimensions: animatedCanvasDimensionsToDimensions(
      viewDataContext.canvasDimensions
    ),
    disableGestures: false, // TODO: Add support for disabling gestures
    initialScale: viewDataContext.initialScale.value,
    vertexRadius
  };
  const targetTransformation = targetStep
    ? getMultiStepVertexTransformation(targetStep, transformationConfig)
    : undefined;
  const sourceTransformation = sourceStep
    ? getMultiStepVertexTransformation(sourceStep, transformationConfig)
    : undefined;

  updateFocusTransformation(
    {
      end: targetTransformation,
      start: sourceTransformation
    },
    focusContext
  );

  return {
    endUpdated: !!targetTransformation,
    startUpdated: !!sourceTransformation
  };
};

export const createFocusSteps = <V>(
  sortedPoints: Array<UpdatedFocusPoint>,
  verticesData: Record<string, VertexComponentData<V>>
): Array<FocusStepData<V>> => {
  'worklet';
  return sortedPoints
    .map(({ point, startsAt }) => ({
      point,
      startsAt: +startsAt,
      vertex: verticesData[point.key]
    }))
    .filter(step => step.vertex) as Array<FocusStepData<V>>;
};

const expandPointsMapping = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>> // must be sorted
): Array<FocusPointMapping<V>> => {
  'worklet';
  const result: Array<MappingSourcePoint> = [];
};

const shrinkPointsMapping = <V>(
  sourcePoints: Array<MappingSourcePoint>,
  targetStepsData: Array<FocusStepData<V>> // must be sorted
): Array<FocusPointMapping<V>> => {};

const getMappingSourcePoints = <V>(
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
      transform: {
        ...calcTranslationOnProgress(
          transitionProgress,
          sourceTransform,
          targetTransform
        ),
        scale: calcValueOnProgress(
          transitionProgress,
          sourceTransform.scale,
          targetTransform.scale
        )
      }
    };
  });
};

const updateProgressBounds = <V>(
  { from, to }: FocusBoundsMapping,
  targetStepsData: Array<FocusStepData<V>>,
  transitionProgress: number
): FocusBoundsMapping => {
  'worklet';
  const currentBounds = {
    max: calcValueOnProgress(transitionProgress, from.max, to.max),
    min: calcValueOnProgress(transitionProgress, from.min, to.min)
  };

  if (!targetStepsData.length) {
    return {
      from: currentBounds,
      to: { max: 1, min: 0 }
    };
  }

  const newPointMax = targetStepsData[targetStepsData.length - 1]!.startsAt;
  const newPointMin = targetStepsData[0]!.startsAt;

  let newMax = Math.max(newPointMax, 1);
  let newMin = Math.min(newPointMin, 0);
  let oldMax = currentBounds.max;
  let oldMin = currentBounds.min;

  if (newPointMax === 1 && currentBounds.max !== 1) {
    newMax += 1 - currentBounds.max;
  } else if (newPointMax !== 1 && currentBounds.max === 1) {
    oldMax += 1 - newPointMax;
  }

  if (newPointMin === 0 && currentBounds.min !== 0) {
    newMin -= currentBounds.min;
  } else if (newPointMin !== 0 && currentBounds.min === 0) {
    oldMin -= newPointMin;
  }

  return {
    from: {
      max: oldMax,
      min: oldMin
    },
    to: {
      max: newMax,
      min: newMin
    }
  };
};

const updatePath = <V>(
  oldPath: FocusPath<V>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  transitionProgress: number,
  focusConfig: FocusConfig
): FocusPath<V> => {
  'worklet';
  // Update mapping source points
  const sourcePoints = getMappingSourcePoints(
    oldPath.points,
    transitionProgress,
    focusConfig
  );
  // Update points mapping
  const updatedPointsMapping =
    targetStepsData.length > sourcePoints.length
      ? expandPointsMapping(sourcePoints, targetStepsData)
      : shrinkPointsMapping(sourcePoints, targetStepsData);
  // Update progress bounds
  const updatedProgressBounds = updateProgressBounds(
    oldPath.progressBounds,
    targetStepsData,
    transitionProgress
  );

  return {
    points: updatedPointsMapping,
    progressBounds: updatedProgressBounds
  };
};

const cleanupPath = <V>(oldPath: FocusPath<V>): FocusPath<V> => {
  'worklet';
  const { points: oldPointsMapping } = oldPath;
  // Filter out points with the same startsAt value
  const cleanedPointsMapping = oldPointsMapping.filter(
    ({ from, to }, i) =>
      i === 0 ||
      from.startsAt !== oldPointsMapping[i - 1]!.from.startsAt ||
      to.startsAt !== oldPointsMapping[i - 1]!.to.startsAt
  );
  // Change transition bounds to the real range (0 - 1)
  const cleanedProgressBounds = {
    from: { max: 1, min: 0 },
    to: { max: 1, min: 0 }
  };

  return {
    points: cleanedPointsMapping,
    progressBounds: cleanedProgressBounds
  };
};

export const updateFocusPath = <V>(
  path: SharedValue<FocusPath<V>>,
  transitionProgress: SharedValue<number>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  animationSettings: AllAnimationSettings | null,
  focusConfig: FocusConfig
) => {
  'worklet';
  // Set transition progress to -1 to prevent updating focus position
  // while we are updating focus path
  transitionProgress.value = -1;
  // Get the new path
  const updatedPath = updatePath(
    path.value,
    targetStepsData,
    transitionProgress.value,
    focusConfig
  );
  // Update transition progress
  // Without animation
  if (!animationSettings) {
    transitionProgress.value = 1;
    path.value = cleanupPath(updatedPath);
    return;
  }
  // With animation
  path.value = updatedPath;
  const { onComplete, ...timingConfig } = animationSettings;
  transitionProgress.value = 0;
  const handleComplete = () => {
    path.value = cleanupPath(updatedPath);
    onComplete?.();
  };
  transitionProgress.value = withTiming(1, timingConfig, handleComplete);
};

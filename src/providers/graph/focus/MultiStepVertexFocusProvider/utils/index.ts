/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SharedValue, withTiming } from 'react-native-reanimated';

import {
  FocusBoundsMapping,
  FocusConfig,
  FocusPath,
  FocusPointMapping,
  FocusStepData,
  MappingSourcePoint,
  MultiStepFocusStateProps as StateProps,
  VertexComponentData
} from '@/types/data';
import {
  InternalMultiStepFocusSettings,
  UpdatedFocusPoint
} from '@/types/settings';
import {
  getMultiStepVertexTransformation,
  updateFocusTransformation
} from '@/utils/focus';
import { animatedCanvasDimensionsToDimensions } from '@/utils/placement';
import {
  calcTransformationOnProgress,
  calcValueOnProgress
} from '@/utils/views';

import { expandPointsMapping } from './expand';
import { shrinkPointsMapping } from './shrink';

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

const updateProgressBounds = <V>(
  updatedPointsMapping: Array<FocusPointMapping<V>>,
  {
    hasSourcePoints,
    hasTargetSteps
  }: { hasSourcePoints: boolean; hasTargetSteps: boolean }
): FocusBoundsMapping => {
  ('worklet');
  const sourceBounds = {
    max: updatedPointsMapping[updatedPointsMapping.length - 1]!.from.startsAt,
    min: updatedPointsMapping[0]!.from.startsAt
  };
  const targetBounds = {
    max: updatedPointsMapping[updatedPointsMapping.length - 1]!.to.startsAt,
    min: updatedPointsMapping[0]!.to.startsAt
  };

  // Slide from top
  if (!hasSourcePoints) {
    return {
      from: { max: 2, min: 1 },
      to: { max: 1, min: 0 }
    };
  }
  // Slide to top
  if (!hasTargetSteps) {
    return {
      from: {
        max: Math.max(sourceBounds.max, 1),
        min: Math.min(sourceBounds.min, 0)
      },
      to: { max: 2, min: 1 }
    };
  }

  let newMax = 1;
  let newMin = 0;
  let oldMax = Math.max(sourceBounds.max, 1);
  let oldMin = Math.min(sourceBounds.min, 0);

  if (targetBounds.max === 1) {
    newMax = 2 - sourceBounds.max;
  } else if (sourceBounds.max === 1) {
    oldMax = 2 - targetBounds.max;
  }

  if (targetBounds.min === 0) {
    newMin = -sourceBounds.min;
  } else if (sourceBounds.min === 0) {
    oldMin = -targetBounds.min;
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
      transform: calcTransformationOnProgress(
        transitionProgress,
        sourceTransform,
        targetTransform
      )
    };
  });
};

const updatePath = <V>(
  oldPath: FocusPath<V>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  transitionProgress: number,
  focusProgress: number,
  focusConfig: FocusConfig
): FocusPath<V> => {
  'worklet';
  // Get source points
  const sourcePoints = getMappingSourcePoints(
    oldPath.points,
    transitionProgress,
    focusConfig
  );
  // Update points mapping
  const updatedPointsMapping =
    targetStepsData.length > oldPath.points.length
      ? expandPointsMapping(
          sourcePoints,
          targetStepsData,
          focusProgress,
          focusConfig
        )
      : shrinkPointsMapping(sourcePoints, targetStepsData, focusProgress);
  // Update progress bounds
  const updatedProgressBounds = updateProgressBounds(updatedPointsMapping, {
    hasSourcePoints: !!sourcePoints.length,
    hasTargetSteps: !!targetStepsData.length
  });

  return {
    points: updatedPointsMapping,
    progressBounds: updatedProgressBounds
  };
};

const withinBounds = (value: number) => value >= 0 && value <= 1;

const cleanupPath = <V>(oldPath: FocusPath<V>): FocusPath<V> => {
  'worklet';
  const { points: oldPointsMapping } = oldPath;
  // Filter out points with the same startsAt value
  const cleanedPointsMapping = oldPointsMapping.filter(
    ({ from, to }, i) =>
      i === 0 ||
      (from.startsAt !== oldPointsMapping[i - 1]!.from.startsAt &&
        withinBounds(from.startsAt)) ||
      (to.startsAt !== oldPointsMapping[i - 1]!.to.startsAt &&
        withinBounds(to.startsAt))
  );
  // Change transition bounds to the real range (0 - 1)
  // (or to (1 - 1) if there are no points)
  const cleanedProgressBounds = cleanedPointsMapping.length
    ? {
        from: { max: 1, min: 0 },
        to: { max: 1, min: 0 }
      }
    : {
        from: { max: 1, min: 1 },
        to: { max: 1, min: 1 }
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
  focusConfig: FocusConfig,
  settings: InternalMultiStepFocusSettings
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
    settings.progress.value,
    focusConfig
  );
  // Update transition progress
  // Without animation
  const animationSettings = settings.pointsChangeAnimationSettings;
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

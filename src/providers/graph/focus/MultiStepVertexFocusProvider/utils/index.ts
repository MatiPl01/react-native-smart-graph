/* eslint-disable import/no-unused-modules */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SharedValue, withTiming } from 'react-native-reanimated';

import {
  FocusBoundsMapping,
  FocusConfig,
  FocusPath,
  FocusPointMapping,
  FocusStepData,
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
import { calcValueOnProgress } from '@/utils/views';

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
  oldProgressBounds: FocusBoundsMapping,
  focusProgress: number,
  transitionProgress: number,
  {
    hasSourcePoints,
    hasTargetSteps
  }: { hasSourcePoints: boolean; hasTargetSteps: boolean }
): FocusBoundsMapping => {
  'worklet';
  if (!updatedPointsMapping.length) {
    return {
      from: { max: 1, min: 1 },
      to: { max: 1, min: 1 }
    };
  }

  // Slide from top
  if (!hasSourcePoints) {
    return {
      from: { max: focusProgress + 2, min: focusProgress + 1 },
      to: { max: 1, min: 0 }
    };
  }

  // Get current progress bounds
  const currentProgressBounds = {
    max: calcValueOnProgress(
      transitionProgress,
      oldProgressBounds.from.max,
      oldProgressBounds.to.max
    ),
    min: calcValueOnProgress(
      transitionProgress,
      oldProgressBounds.from.min,
      oldProgressBounds.to.min
    )
  };

  // Slide to top
  if (!hasTargetSteps) {
    return {
      from: currentProgressBounds,
      to: { max: focusProgress + 2, min: focusProgress + 1 }
    };
  }

  const sourceBounds = {
    max: updatedPointsMapping[updatedPointsMapping.length - 1]!.from.startsAt,
    min: updatedPointsMapping[0]!.from.startsAt
  };
  const targetBounds = {
    max: updatedPointsMapping[updatedPointsMapping.length - 1]!.to.startsAt,
    min: updatedPointsMapping[0]!.to.startsAt
  };

  let newMax = 1;
  let newMin = 0;
  let oldMax = currentProgressBounds.max;
  let oldMin = currentProgressBounds.min;

  if (targetBounds.max === 1 && sourceBounds.max < 1) {
    newMax = 2 - sourceBounds.max;
  } else if (sourceBounds.max === 1 && oldMax === 1) {
    oldMax = 2 - targetBounds.max;
  }

  if (targetBounds.min === 0 && sourceBounds.min > 0) {
    newMin = -sourceBounds.min;
  } else if (sourceBounds.min === 0 && oldMin === 0) {
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

const updatePath = <V>(
  oldPath: FocusPath<V>,
  targetStepsData: Array<FocusStepData<V>>, // must be sorted
  transitionProgress: number,
  focusProgress: number,
  focusConfig: FocusConfig
): FocusPath<V> => {
  'worklet';
  // Update points mapping
  const updatedPointsMapping =
    targetStepsData.length >= oldPath.points.length
      ? expandPointsMapping(
          oldPath,
          targetStepsData,
          transitionProgress,
          focusProgress,
          focusConfig
        )
      : shrinkPointsMapping(
          oldPath,
          targetStepsData,
          focusProgress,
          transitionProgress,
          focusConfig
        );
  // Update progress bounds
  const updatedProgressBounds = updateProgressBounds(
    updatedPointsMapping,
    oldPath.progressBounds,
    focusProgress,
    transitionProgress,
    {
      hasSourcePoints: !!oldPath.points.length,
      hasTargetSteps: !!targetStepsData.length
    }
  );

  return {
    points: updatedPointsMapping,
    progressBounds: updatedProgressBounds
  };
};

const withinBounds = (value: number) => {
  'worklet';
  return value >= 0 && value <= 1;
};

const cleanupPath = <V>(oldPath: FocusPath<V>): FocusPath<V> => {
  'worklet';
  console.log('\n!!! cleanupPath !!!\n');
  const { points: oldPointsMapping } = oldPath;
  // Filter out points with the same startsAt value
  const cleanedPointsMapping = oldPointsMapping.filter(
    ({ to }, i) =>
      withinBounds(to.startsAt) &&
      (i === 0 || to.startsAt !== oldPointsMapping[i - 1]!.to.startsAt)
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
  // Get the new path
  const updatedPath = updatePath(
    path.value,
    targetStepsData,
    transitionProgress.value,
    settings.progress.value,
    focusConfig
  );
  // Set transition progress to -1 to prevent updating focus position
  // while we are updating focus path
  transitionProgress.value = -1;
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
  const handleComplete = (completed?: boolean) => {
    'worklet';
    if (!completed) return;
    path.value = cleanupPath(updatedPath);
    onComplete?.();
  };
  transitionProgress.value = withTiming(1, timingConfig, handleComplete);
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SharedValue, withTiming } from 'react-native-reanimated';

import {
  FocusBoundsMapping,
  FocusConfig,
  FocusPath,
  FocusPointMapping,
  FocusStepData,
  MultiStepFocusStateProps as StateProps,
  TransformedFocusData,
  TransformedFocusPoint,
  VertexComponentData
} from '@/types/data';
import {
  InternalMultiStepFocusSettings,
  UpdatedFocusPoint
} from '@/types/settings';
import { updateFocusTransformation } from '@/utils/focus';
import { calcValueOnProgress } from '@/utils/views';

import { expandPointsMapping } from './expand';
import { getTransformedFocusPoint } from './shared';
import { shrinkPointsMapping } from './shrink';

export const getTargetPoint = ({
  data: { afterStep, beforeStep },
  progress,
  targetPoint: { value: prevTargetPoint }
}: StateProps): TransformedFocusPoint | null => {
  'worklet';
  if (progress.current < progress.previous) {
    return beforeStep ?? null;
  } else if (progress.current > progress.previous) {
    return afterStep ?? null;
  }
  if (
    beforeStep &&
    (beforeStep.startsAt === prevTargetPoint?.startsAt || !prevTargetPoint) &&
    progress.current > beforeStep.startsAt
  ) {
    return afterStep ?? null;
  }
  if (
    afterStep &&
    (afterStep.startsAt === prevTargetPoint?.startsAt || !prevTargetPoint) &&
    progress.current < afterStep.startsAt
  ) {
    return beforeStep ?? null;
  }
  return prevTargetPoint;
};

export const getTransitionBounds = ({
  data: { afterStep, beforeStep },
  syncProgress,
  targetPoint: { value: targetPoint }
}: StateProps): {
  source: TransformedFocusPoint | null;
  target: TransformedFocusPoint | null;
} => {
  'worklet';
  let targetStep: TransformedFocusPoint | null = null;
  let sourceStep: TransformedFocusPoint | null = null;

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

export const updateTransitionPoints = (props: StateProps): void => {
  'worklet';
  const { source: sourceStep, target: targetStep } = getTransitionBounds(props);

  updateFocusTransformation(
    {
      end: targetStep?.transform,
      start: sourceStep?.transform
    },
    props.focusContext
  );
};

const getAfterStep = <V>(
  path: FocusPath<V>,
  progress: { current: number; transition: number },
  currentStepIdx: number
): { currentIdx: number; step?: FocusPointMapping<V> } => {
  'worklet';
  let step = path.points[currentStepIdx];

  while (
    step &&
    progress.current >
      calcValueOnProgress(
        progress.transition,
        step.from.startsAt,
        step.to.startsAt
      )
  ) {
    step = path.points[currentStepIdx + 1];
    currentStepIdx++;
  }
  return { currentIdx: currentStepIdx, step };
};

const getBeforeStep = <V>(
  path: FocusPath<V>,
  progress: { current: number; transition: number },
  currentStepIdx: number
): { currentIdx: number; step?: FocusPointMapping<V> } => {
  'worklet';
  let step = path.points[currentStepIdx - 1];

  while (
    step &&
    progress.current <
      calcValueOnProgress(
        progress.transition,
        step.from.startsAt,
        step.to.startsAt
      )
  ) {
    step = path.points[currentStepIdx - 1];
    currentStepIdx--;
  }
  return { currentIdx: currentStepIdx, step };
};

const calcStepStartsAt = <V>(
  path: FocusPath<V>,
  transitionProgress: number,
  mapping: FocusPointMapping<V> | undefined,
  bound: 'max' | 'min'
): number => {
  'worklet';
  return mapping
    ? calcValueOnProgress(
        transitionProgress,
        mapping.from.startsAt,
        mapping.to.startsAt
      )
    : calcValueOnProgress(
        transitionProgress,
        path.progressBounds.from[bound],
        path.progressBounds.to[bound]
      );
};

export const transformFocusData = <V>(
  path: FocusPath<V>,
  progress: {
    current: number;
    transition: number;
  },
  currentStepIdx: number,
  focusConfig: FocusConfig
): TransformedFocusData | null => {
  'worklet';
  // Either getAfterStep or getBeforeStep will return the same step
  // so we can use the same currentStepIdx for both and update it
  // after each call
  const afterStep = getAfterStep(path, progress, currentStepIdx);
  currentStepIdx = afterStep.currentIdx;
  const beforeStep = getBeforeStep(path, progress, currentStepIdx);
  currentStepIdx = beforeStep.currentIdx;

  const beforeStepStartsAt = calcStepStartsAt(
    path,
    progress.transition,
    beforeStep.step,
    'min'
  );
  const afterStepStartsAt = calcStepStartsAt(
    path,
    progress.transition,
    afterStep.step,
    'max'
  );

  const pointsTransitionProgress =
    (progress.current - beforeStepStartsAt) /
    (afterStepStartsAt - beforeStepStartsAt);

  return {
    afterStep: beforeStep.step
      ? getTransformedFocusPoint(
          beforeStep.step,
          focusConfig,
          progress.transition
        )
      : null,
    beforeStep: afterStep.step
      ? getTransformedFocusPoint(
          afterStep.step,
          focusConfig,
          progress.transition
        )
      : null,
    currentStepIdx,
    pointsTransitionProgress,
    targetAnimationProgress: progress.transition * pointsTransitionProgress
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
  // Update transition progress
  // Without animation
  const animationSettings = settings.pointsChangeAnimationSettings;
  if (!animationSettings) {
    path.value = cleanupPath(updatedPath);
    transitionProgress.value = 1;
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

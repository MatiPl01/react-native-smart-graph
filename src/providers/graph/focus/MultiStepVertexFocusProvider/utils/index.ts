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

  if (targetPoint?.id === beforeStep?.id) {
    targetStep = beforeStep;
    sourceStep = afterStep;
  } else if (targetPoint?.id === afterStep?.id) {
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

const getCurrentSteps = <V>(
  path: FocusPath<V>,
  progress: { current: number; transition: number },
  afterStepIdx: number
): {
  afterStep?: FocusPointMapping<V>;
  afterStepIdx: number;
  beforeStep?: FocusPointMapping<V>;
} => {
  'worklet';
  let afterStep = path.points[afterStepIdx];
  let beforeStep = path.points[afterStepIdx - 1];

  // Either the first or the second loop will be executed
  // (never both at the same time)
  // so we can use the same afterStepIdx for both and update it
  while (
    afterStep &&
    progress.current >
      calcValueOnProgress(
        progress.transition,
        afterStep.from.startsAt,
        afterStep.to.startsAt
      )
  ) {
    beforeStep = afterStep;
    afterStep = path.points[afterStepIdx + 1];
    afterStepIdx++;
  }

  while (
    beforeStep &&
    progress.current <
      calcValueOnProgress(
        progress.transition,
        beforeStep.from.startsAt,
        beforeStep.to.startsAt
      )
  ) {
    afterStep = beforeStep;
    beforeStep = path.points[afterStepIdx - 1];
    afterStepIdx--;
  }

  return {
    afterStep,
    afterStepIdx,
    beforeStep
  };
};

export const calcStepStartsAt = <V>(
  progressBounds: FocusBoundsMapping,
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
        progressBounds.from[bound],
        progressBounds.to[bound]
      );
};

export const transformFocusData = <V>(
  path: FocusPath<V>,
  progress: {
    current: number;
    transition: number;
  },
  afterStepIdx: number,
  focusConfig: FocusConfig
): TransformedFocusData | null => {
  'worklet';
  const steps = getCurrentSteps(path, progress, afterStepIdx);

  const beforeStepStartsAt = calcStepStartsAt(
    path.progressBounds,
    progress.transition,
    steps.beforeStep,
    'min'
  );
  const afterStepStartsAt = calcStepStartsAt(
    path.progressBounds,
    progress.transition,
    steps.afterStep,
    'max'
  );

  const pointsTransitionProgress = Math.max(
    (progress.current - beforeStepStartsAt) /
      (afterStepStartsAt - beforeStepStartsAt),
    0
  );

  return {
    afterStep: steps.afterStep
      ? getTransformedFocusPoint(
          steps.afterStep,
          steps.afterStepIdx,
          focusConfig,
          progress.transition
        )
      : null,
    afterStepIdx: steps.afterStepIdx,
    beforeStep: steps.beforeStep
      ? getTransformedFocusPoint(
          steps.beforeStep,
          steps.afterStepIdx - 1,
          focusConfig,
          progress.transition
        )
      : null,
    pointsTransitionProgress,
    targetAnimationProgress: progress.transition * pointsTransitionProgress
  };
};

export const getResultingProgress = ({
  data: { beforeStep, pointsTransitionProgress },
  targetPoint: { value: targetPoint }
}: StateProps): number => {
  'worklet';
  return targetPoint?.startsAt === beforeStep?.startsAt
    ? 1 - pointsTransitionProgress
    : pointsTransitionProgress;
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
      from: { max: focusProgress + 1, min: focusProgress },
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
      to: { max: focusProgress + 1, min: focusProgress }
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

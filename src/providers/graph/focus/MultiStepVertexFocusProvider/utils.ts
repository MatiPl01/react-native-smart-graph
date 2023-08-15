import { FocusStepData, VertexComponentData } from '@/types/data';
import { UpdatedFocusPoint } from '@/types/settings';
import {
  getMultiStepVertexTransformation,
  updateFocusTransformation
} from '@/utils/focus';
import { animatedCanvasDimensionsToDimensions } from '@/utils/placement';

import { StateProps } from './types';

export const createFocusSteps = <V, E>(
  sortedPoints: Array<UpdatedFocusPoint>,
  verticesData: Record<string, VertexComponentData<V, E>>
): Array<FocusStepData<V, E>> => {
  'worklet';
  return sortedPoints
    .map(({ point, startsAt }) => ({
      point,
      startsAt: +startsAt,
      vertex: verticesData[point.key]
    }))
    .filter(step => step.vertex !== undefined) as Array<FocusStepData<V, E>>;
};

export const getTargetPoint = <V, E>({
  afterStep,
  beforeStep,
  currentProgress,
  previousProgress,
  targetPoint: { value: prevTargetPoint }
}: StateProps<V, E>): UpdatedFocusPoint | null => {
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

export const getResultingProgress = <V, E>(
  targetStep: FocusStepData<V, E> | null,
  { afterStep, beforeStep, currentProgress, syncProgress }: StateProps<V, E>
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

export const getTransitionBounds = <V, E>({
  afterStep,
  beforeStep,
  syncProgress,
  targetPoint: { value: targetPoint }
}: StateProps<V, E>): {
  source: FocusStepData<V, E> | null;
  target: FocusStepData<V, E> | null;
} => {
  'worklet';
  let targetStep: FocusStepData<V, E> | null = null;
  let sourceStep: FocusStepData<V, E> | null = null;

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

export const updateTransitionPoints = <V, E>(
  props: StateProps<V, E>
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

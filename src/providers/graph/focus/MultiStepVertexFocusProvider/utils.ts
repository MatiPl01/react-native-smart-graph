import { FocusStepData } from '@/types/data';
import {
  getMultiStepVertexTransformation,
  updateFocusTransformation
} from '@/utils/focus';
import { animatedCanvasDimensionsToDimensions } from '@/utils/placement';

import { StateProps } from './types';

export const getTargetKey = <V, E>({
  afterStep,
  beforeStep,
  currentProgress,
  previousProgress,
  targetKey: { value: prevTargetKey }
}: StateProps<V, E>): null | string => {
  'worklet';
  if (currentProgress < previousProgress) {
    return beforeStep?.point.key ?? null;
  } else if (currentProgress > previousProgress) {
    return afterStep?.point.key ?? null;
  }
  if (
    beforeStep &&
    (beforeStep.point.key === prevTargetKey || prevTargetKey === null) &&
    currentProgress > beforeStep.startsAt
  ) {
    return afterStep?.point.key ?? null;
  }
  if (
    afterStep &&
    (afterStep.point.key === prevTargetKey || prevTargetKey === null) &&
    currentProgress < afterStep.startsAt
  ) {
    return beforeStep?.point.key ?? null;
  }
  return prevTargetKey;
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
  targetKey: { value: targetKey }
}: StateProps<V, E>): {
  source: FocusStepData<V, E> | null;
  target: FocusStepData<V, E> | null;
} => {
  'worklet';
  let targetStep: FocusStepData<V, E> | null = null;
  let sourceStep: FocusStepData<V, E> | null = null;

  if (targetKey === beforeStep?.point.key) {
    targetStep = beforeStep;
    sourceStep = afterStep;
  } else if (targetKey === afterStep?.point.key) {
    targetStep = afterStep;
    sourceStep = beforeStep;
  } else if (targetKey === null) {
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
    vertexRadius: vertexRadius.value // TODO - make this work with shared values
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

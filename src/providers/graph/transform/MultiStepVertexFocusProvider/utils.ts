import { FocusStepData } from '@/types/focus';
import {
  getMultiStepVertexTransformation,
  updateFocusTransformation
} from '@/utils/focus';
import { animatedCanvasDimensionsToDimensions } from '@/utils/placement';

import { StateProps } from './types';

export const getTargetKey = ({
  afterStep,
  beforeStep,
  currentProgress,
  previousProgress,
  targetKey: { value: prevTargetKey }
}: StateProps): null | string => {
  'worklet';
  if (currentProgress < previousProgress) {
    return beforeStep?.value.key ?? null;
  } else if (currentProgress > previousProgress) {
    return afterStep?.value.key ?? null;
  }
  if (
    beforeStep &&
    (beforeStep.value.key === prevTargetKey || prevTargetKey === null) &&
    currentProgress > beforeStep.startsAt
  ) {
    return afterStep?.value.key ?? null;
  }
  if (
    afterStep &&
    (afterStep.value.key === prevTargetKey || prevTargetKey === null) &&
    currentProgress < afterStep.startsAt
  ) {
    return beforeStep?.value.key ?? null;
  }
  return prevTargetKey;
};

export const getResultingProgress = (
  targetStep: FocusStepData | null,
  { afterStep, beforeStep, currentProgress, syncProgress }: StateProps
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

export const getTransitionBounds = ({
  afterStep,
  beforeStep,
  syncProgress,
  targetKey: { value: targetKey }
}: StateProps): {
  source: FocusStepData | null;
  target: FocusStepData | null;
} => {
  'worklet';
  let targetStep: FocusStepData | null = null;
  let sourceStep: FocusStepData | null = null;

  if (targetKey === beforeStep?.value.key) {
    targetStep = beforeStep;
    sourceStep = afterStep;
  } else if (targetKey === afterStep?.value.key) {
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

export const updateTransitionPoints = (
  props: StateProps
): {
  endUpdated?: boolean;
  startUpdated?: boolean;
} => {
  'worklet';
  const { canvasDataContext, focusContext, vertexRadius } = props;
  const { source: sourceStep, target: targetStep } = getTransitionBounds(props);

  const transformationConfig = {
    availableScales: canvasDataContext.scales.value,
    canvasDimensions: animatedCanvasDimensionsToDimensions(
      canvasDataContext.canvasDimensions
    ),
    initialScale: canvasDataContext.initialScale.value,
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

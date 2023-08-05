import { FocusContextType } from '@/providers/canvas';
import { FocusedVertexData, FocusStepData } from '@/types/data';
import {
  Alignment,
  AnimatedVectorCoordinates,
  Dimensions
} from '@/types/layout';
import { AllFocusSettings } from '@/types/settings';

import {
  getAlignedVertexAbsolutePosition,
  getCoordinatesRelativeToCenter
} from './layout';

export const getFocusedVertexData = (
  focusedVertexWithPosition: {
    key: string;
    position: AnimatedVectorCoordinates;
  } | null,
  vertexRadius: number,
  settings: AllFocusSettings
): FocusedVertexData => {
  'worklet';
  if (!focusedVertexWithPosition) {
    return { animation: settings.animation };
  }

  return {
    animation: settings.animation,
    vertex: {
      ...focusedVertexWithPosition,
      alignment: settings.alignment,
      radius: vertexRadius,
      scale: settings.vertexScale
    }
  };
};

type VertexTransformation = {
  scale: number;
  x: number;
  y: number;
};

type TransformationInput = {
  alignment: Required<Alignment>;
  canvasDimensions: Dimensions;
  vertex: VertexTransformation & {
    radius: number;
  };
};

export const updateFocusTransformation = (
  transformation: {
    end?: VertexTransformation;
    start?: VertexTransformation;
  },
  focusContext: FocusContextType
): void => {
  'worklet';
  if (transformation.start) {
    focusContext.focus.start.scale.value = transformation.start.scale;
    focusContext.focus.start.x.value = transformation.start.x;
    focusContext.focus.start.y.value = transformation.start.y;
  }
  if (transformation.end) {
    focusContext.focus.end.scale.value = transformation.end.scale;
    focusContext.focus.end.x.value = transformation.end.x;
    focusContext.focus.end.y.value = transformation.end.y;
  }
};

export const getFocusedVertexTransformation = ({
  alignment,
  canvasDimensions,
  vertex
}: TransformationInput): VertexTransformation => {
  'worklet';
  // Calculate vertex position based on the alignment settings
  const { x: dx, y: dy } = getCoordinatesRelativeToCenter(
    canvasDimensions,
    getAlignedVertexAbsolutePosition(
      canvasDimensions,
      alignment,
      vertex.radius * vertex.scale
    )
  );
  return {
    scale: vertex.scale,
    x: vertex.x - dx / vertex.scale,
    y: vertex.y - dy / vertex.scale
  };
};

type FocusConfig = {
  canvasDimensions: Dimensions;
  disableGestures: boolean;
  vertexRadius: number;
};

export const getMultiStepVertexTransformation = <V, E>(
  stepData: FocusStepData<V, E>,
  config: FocusConfig
): VertexTransformation => {
  'worklet';

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { alignment, position, radius, scale } = getFocusedVertexData(
    {
      key: stepData.point.key,
      position: stepData.vertex.position
    },
    config.vertexRadius,
    {
      alignment: stepData.point.alignment,
      animation: null,
      disableGestures: config.disableGestures,
      vertexScale: stepData.point.vertexScale
    }
  ).vertex!;

  return getFocusedVertexTransformation({
    alignment,
    canvasDimensions: config.canvasDimensions,
    vertex: {
      radius,
      scale,
      x: position.x.value,
      y: position.y.value
    }
  });
};

export const getFocusSteps = <V, E>(
  progress: number,
  previousStep: number,
  focusStepsData: Array<FocusStepData<V, E>>
): {
  afterStep: FocusStepData<V, E> | null;
  beforeStep: FocusStepData<V, E> | null;
  currentStep: number;
} | null => {
  'worklet';
  let afterStep = focusStepsData[previousStep];
  let beforeStep = focusStepsData[previousStep - 1];

  if (!afterStep && !beforeStep) return null;

  while (afterStep && progress > afterStep.startsAt) {
    beforeStep = afterStep;
    afterStep = focusStepsData[previousStep + 1];
    previousStep++;
  }
  while (beforeStep && progress < beforeStep.startsAt) {
    afterStep = beforeStep;
    beforeStep = focusStepsData[previousStep - 2];
    previousStep--;
  }

  return {
    afterStep: afterStep ?? null,
    beforeStep: beforeStep ?? null,
    currentStep: previousStep
  };
};

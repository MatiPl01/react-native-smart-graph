import { FocusContextType } from '@/providers/view';
import { FocusStepData } from '@/types/data';
import { Alignment, Dimensions } from '@/types/layout';

import {
  getAlignedVertexAbsolutePosition,
  getCoordinatesRelativeToCenter
} from './layout';

type VertexTransformation = {
  scale: number;
  x: number;
  y: number;
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

// eslint-disable-next-line import/no-unused-modules
export const getFocusedVertexTransformation = (
  alignment: Required<Alignment>,
  canvasDimensions: Dimensions,
  vertex: VertexTransformation,
  vertexRadius: number
): VertexTransformation => {
  'worklet';
  // Calculate vertex position based on the alignment settings
  const { x: dx, y: dy } = getCoordinatesRelativeToCenter(
    canvasDimensions,
    getAlignedVertexAbsolutePosition(
      canvasDimensions,
      alignment,
      vertexRadius * vertex.scale
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

export const getMultiStepVertexTransformation = <V>(
  stepData: FocusStepData<V>,
  config: FocusConfig
): VertexTransformation => {
  'worklet';

  // // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // const { alignment, position, radius, scale } = getFocusedVertexData(
  //   {
  //     key: stepData.point.key,
  //     position: stepData.vertex.position
  //   },
  //   config.vertexRadius,
  //   {
  //     alignment: stepData.point.alignment,
  //     animation: null,
  //     disableGestures: config.disableGestures,
  //     vertexScale: stepData.point.vertexScale
  //   }
  // ).vertex!;

  // return getFocusedVertexTransformation({
  //   alignment,
  //   canvasDimensions: config.canvasDimensions,
  //   vertex: {
  //     radius,
  //     scale,
  //     x: position.x.value,
  //     y: position.y.value
  //   }
  // });
};

export const getFocusSteps = <V>(
  progress: number,
  previousStepIdx: number,
  focusStepsData: Array<FocusStepData<V>>
): {
  afterStep: FocusStepData<V> | null;
  beforeStep: FocusStepData<V> | null;
  currentStepIdx: number;
} | null => {
  'worklet';
  let afterStep = focusStepsData[previousStepIdx];
  let beforeStep = focusStepsData[previousStepIdx - 1];

  if (!afterStep && !beforeStep) return null;

  while (afterStep && progress > afterStep.startsAt) {
    beforeStep = afterStep;
    afterStep = focusStepsData[previousStepIdx + 1];
    previousStepIdx++;
  }
  while (beforeStep && progress < beforeStep.startsAt) {
    afterStep = beforeStep;
    beforeStep = focusStepsData[previousStepIdx - 2];
    previousStepIdx--;
  }

  return {
    afterStep: afterStep ?? null,
    beforeStep: beforeStep ?? null,
    currentStepIdx: previousStepIdx
  };
};

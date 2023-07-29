import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
import {
  DEFAULT_ALIGNMENT_SETTINGS,
  DEFAULT_FOCUS_SCALE_MULTIPLIER
} from '@/constants/focus';
import { FocusContextType } from '@/providers/canvas';
import { FocusStepData } from '@/types/focus';
import {
  Alignment,
  AnimatedVectorCoordinates,
  Dimensions
} from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { FocusedVertexData, FocusSettings } from '@/types/settings/focus';

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
  availableScales: number[],
  initialScale: number,
  settings?: FocusSettings
): FocusedVertexData => {
  'worklet';
  const animationSettings =
    settings?.animation !== null
      ? ({
          ...DEFAULT_FOCUS_ANIMATION_SETTINGS,
          ...settings?.animation
        } as AnimationSettingsWithDefaults)
      : null;

  if (!focusedVertexWithPosition) {
    return { animation: animationSettings };
  }

  return {
    animation: animationSettings,
    vertex: {
      ...focusedVertexWithPosition,
      alignment: {
        ...DEFAULT_ALIGNMENT_SETTINGS,
        ...settings?.alignment
      },
      radius: vertexRadius,
      scale:
        settings?.vertexScale ??
        Math.min(
          initialScale * DEFAULT_FOCUS_SCALE_MULTIPLIER,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          availableScales[availableScales.length - 1]!
        )
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
  availableScales: number[];
  canvasDimensions: Dimensions;
  initialScale: number;
  vertexRadius: number;
};

export const getMultiStepVertexTransformation = (
  stepData: FocusStepData,
  config: FocusConfig
): VertexTransformation => {
  'worklet';

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { alignment, position, radius, scale } = getFocusedVertexData(
    {
      key: stepData.value.key,
      position: stepData.vertex.position
    },
    config.vertexRadius,
    config.availableScales,
    config.initialScale,
    {
      alignment: stepData.value.alignment,
      animation: null,
      vertexScale: stepData.value.vertexScale
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

export const getFocusStep = (
  progress: number,
  previousStep: number,
  focusStepsData: Array<FocusStepData>
): {
  afterStep: FocusStepData | null;
  beforeStep: FocusStepData | null;
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

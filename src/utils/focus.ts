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
import { calcScaleOnProgress, calcTranslationOnProgress } from './views';

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

export const updateFocusedVertexTransformation = (
  transformation: VertexTransformation,
  focusContext: FocusContextType
): void => {
  'worklet';
  focusContext.focus.x.value = transformation.x;
  focusContext.focus.y.value = transformation.y;
  focusContext.focus.scale.value = transformation.scale;
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
  disableGestures: boolean;
  initialScale: number;
  vertexRadius: number;
};

const getMultiStepVertexTransformation = (
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
      disableGestures: config.disableGestures,
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

export const getMultiStepFocusTransformation = (
  stepProgress: number,
  config: FocusConfig,
  before?: FocusStepData,
  after?: FocusStepData
): VertexTransformation => {
  'worklet';
  const beforeVertexData =
    before && getMultiStepVertexTransformation(before, config);
  const afterVertexData =
    after && getMultiStepVertexTransformation(after, config);

  if (beforeVertexData && afterVertexData) {
    const { scale: beforeScale, ...beforePosition } = beforeVertexData;
    const { scale: afterScale, ...afterPosition } = afterVertexData;
    return {
      ...calcTranslationOnProgress(stepProgress, beforePosition, afterPosition),
      scale: calcScaleOnProgress(stepProgress, beforeScale, afterScale)
    };
  }
  if (beforeVertexData) {
    return beforeVertexData;
  }
  if (afterVertexData) {
    return afterVertexData;
  }
  return {
    scale: 1,
    x: 0,
    y: 0
  };
};

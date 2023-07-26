import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
import {
  DEFAULT_ALIGNMENT_SETTINGS,
  DEFAULT_FOCUS_SCALE_MULTIPLIER
} from '@/constants/focus';
import { FocusStepData } from '@/types/focus';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { FocusedVertexData, FocusSettings } from '@/types/settings/focus';

import { animatedVectorCoordinatesToVector } from './vectors';
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

export const calcMultiStepFocusTransition = (
  stepProgress: number,
  before?: FocusStepData,
  after?: FocusStepData
): {
  scale: number;
  x: number;
  y: number;
} => {
  'worklet';
  if (before && after) {
    const { position: beforePosition, scale: beforeScale } = before.vertex;
    const { position: afterPosition, scale: afterScale } = after.vertex;
    return {
      ...calcTranslationOnProgress(
        stepProgress,
        animatedVectorCoordinatesToVector(beforePosition),
        animatedVectorCoordinatesToVector(afterPosition)
      ),
      scale: calcScaleOnProgress(
        stepProgress,
        beforeScale.value,
        afterScale.value
      )
    };
  }
  if (before) {
    return {
      ...animatedVectorCoordinatesToVector(before.vertex.position),
      scale: before.vertex.scale.value
    };
  }
  if (after) {
    return {
      ...animatedVectorCoordinatesToVector(after.vertex.position),
      scale: after.vertex.scale.value
    };
  }
  return {
    scale: 1,
    x: 0,
    y: 0
  };
};

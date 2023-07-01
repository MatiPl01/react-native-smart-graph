import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
import {
  DEFAULT_ALIGNMENT_SETTINGS,
  DEFAULT_FOCUS_SCALE_MULTIPLIER
} from '@/constants/focus';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { FocusedVertexData, FocusSettings } from '@/types/settings/focus';

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

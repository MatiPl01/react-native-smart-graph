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

// export const calcMultiStepFocusPoint = (
//   progress: number,
//   focusPoints: Array<{ startsAt: number; value: FocusPoint }>
// ): {
//   after: string;
//   before: string;
//   progress: number;
// } => {
//   'worklet';
//   const idx = binarySearchLE(focusPoints, progress, point => point.startsAt);

//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   const before = focusPoints[idx]!;
//   const after = focusPoints[idx + 1] ?? before;
//   const progressStart = before.startsAt;
//   const progressEnd = after?.startsAt ?? 1;

//   return {
//     after,
//     before,
//     progress: (progress - progressStart) / (progressEnd - progressStart)
//   };
// };

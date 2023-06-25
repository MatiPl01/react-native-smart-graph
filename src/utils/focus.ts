import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
import {
  DEFAULT_ALIGNMENT_SETTINGS,
  DEFAULT_FOCUS_SCALE_MULTIPLIER
} from '@/constants/focus';
import { VertexComponentRenderData } from '@/types/components';
import { FocusedVertexData, FocusSettings } from '@/types/settings/focus';

export const getFocusedVertexData = (
  focusedVertexKey: null | string,
  renderedVerticesData: Record<string, VertexComponentRenderData>,
  vertexRadius: number,
  availableScales: number[],
  initialScale: number,
  settings?: FocusSettings
): FocusedVertexData => {
  const animationSettings = {
    ...DEFAULT_FOCUS_ANIMATION_SETTINGS,
    ...settings?.animation
  };

  const focusedVertexData =
    focusedVertexKey && renderedVerticesData[focusedVertexKey];

  // Return only animation settings if there is no focused vertex
  // or the specified vertex does not exist
  if (!focusedVertexData) {
    return { animation: animationSettings };
  }

  return {
    animation: animationSettings,
    vertex: {
      alignment: {
        ...DEFAULT_ALIGNMENT_SETTINGS,
        ...settings?.alignment
      },
      position: focusedVertexData.position,
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

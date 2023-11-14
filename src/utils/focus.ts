import { FocusContextType } from '@/providers/view';
import { VertexTransformation } from '@/types/data';
import { Alignment, Dimensions } from '@/types/layout';

import {
  getAlignedVertexAbsolutePosition,
  getCoordinatesRelativeToCenter
} from './layout';

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

import { DirectedEdgeRendererProps, EdgeRendererProps } from '@/types/renderer';

export function areDirectedEdgeRendererProps<E>(
  props: EdgeRendererProps<E>
): props is DirectedEdgeRendererProps<E> {
  const { from, to } = props as DirectedEdgeRendererProps<E>;
  return !!(from && to);
}

export const calcUnitVector = (
  from: { x: number; y: number },
  to: { x: number; y: number }
): { x: number; y: number } => {
  'worklet';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mag = Math.sqrt(dx ** 2 + dy ** 2);

  return { x: dx / mag, y: dy / mag };
};

export const translateAlongVector = (
  point: { x: number; y: number },
  unitVector: { x: number; y: number },
  distance: number
): { x: number; y: number } => {
  'worklet';
  return {
    x: point.x + unitVector.x * distance,
    y: point.y + unitVector.y * distance
  };
};

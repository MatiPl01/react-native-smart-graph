import { DirectedEdgeRendererProps, EdgeRendererProps } from '@/types/render';

export function areDirectedEdgeRendererProps<E>(
  props: EdgeRendererProps<E>
): props is DirectedEdgeRendererProps<E> {
  const { from, to } = props as DirectedEdgeRendererProps<E>;
  return !!(from && to);
}

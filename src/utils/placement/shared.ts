import { Vertex } from '@/types/graphs';
import { PlacementProps } from '@/types/placement';

export const getContainerLayout = <V, E>({
  containerWidth,
  containerHeight,
  vertexRadius
}: PlacementProps<V, E>) => {
  const width = containerWidth - 2 * vertexRadius;
  const height = containerHeight - 2 * vertexRadius;

  return {
    width,
    height,
    center: { x: containerWidth / 2, y: containerHeight / 2 },
    radius: Math.min(width, height) / 2
  };
};

export const defaultSortComparator = <V, E>(
  u: Vertex<V, E>,
  v: Vertex<V, E>
) => {
  if (u.key < v.key) {
    return -1;
  }
  if (u.key > v.key) {
    return 1;
  }
  return 0;
};

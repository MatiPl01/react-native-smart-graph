import {
  CircularPlacementSettings,
  PlacedVerticesPositions,
  PlacementProps
} from '@/types/placement';

import { defaultSortComparator, getContainerLayout } from './shared';

const placeVerticesCircular = <V, E>(
  props: PlacementProps<V, E>,
  settings: CircularPlacementSettings<V, E>
): PlacedVerticesPositions => {
  const { graph } = props;
  const { sortVertices, sortComparator = defaultSortComparator } =
    settings || {};
  const vertices = sortVertices
    ? graph.vertices.sort(sortComparator)
    : graph.vertices;

  const { radius, center } = getContainerLayout(props);
  const initialAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / vertices.length;

  return vertices.reduce((acc, { key }, idx) => {
    acc[key] = {
      x: center.x + radius * Math.cos(initialAngle + angleStep * idx),
      y: center.y + radius * Math.sin(initialAngle + angleStep * idx)
    };
    return acc;
  }, {} as PlacedVerticesPositions);
};

export default placeVerticesCircular;

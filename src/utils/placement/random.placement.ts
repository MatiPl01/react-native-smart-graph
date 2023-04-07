import { PlacedVerticesPositions, PlacementProps } from '@/types/placement';

import { getContainerLayout } from './shared';

const placeVerticesRandomly = <V, E>(
  props: PlacementProps<V, E>
): PlacedVerticesPositions => {
  const { width, height } = getContainerLayout(props);

  return props.graph.vertices.reduce((acc, { key }) => {
    acc[key] = {
      x: Math.random() * width + props.vertexRadius,
      y: Math.random() * height + props.vertexRadius
    };
    return acc;
  }, {} as PlacedVerticesPositions);
};

export default placeVerticesRandomly;

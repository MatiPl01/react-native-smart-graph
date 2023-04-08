import { PlacedVerticesPositions } from '@/types/placement';

// TODO
const placeVerticesRandomly = <V, E>(
  props: PlacementProps<V, E>
): PlacedVerticesPositions => {
  return props.graph.vertices.reduce((acc, { key }) => {
    acc[key] = {
      x: Math.random() * width + props.vertexRadius,
      y: Math.random() * height + props.vertexRadius
    };
    return acc;
  }, {} as PlacedVerticesPositions);
};

export default placeVerticesRandomly;

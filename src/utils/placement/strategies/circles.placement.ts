import placeVerticesOnCircle from './circle.placement';
import { Vertex } from '@/types/graphs';
import { CircularPlacementSettings, GraphLayout } from '@/types/settings';
import { arrangeGraphComponents } from '@/utils/placement/shared';

const placeVerticesOnCircles = <V, E>(
  components: Array<Array<Vertex<V, E>>>,
  vertexRadius: number,
  settings: CircularPlacementSettings<V, E>
): GraphLayout => {
  return arrangeGraphComponents(
    components.map(vertices =>
      placeVerticesOnCircle(vertices, vertexRadius, settings)
    )
  );
};

export default placeVerticesOnCircles;

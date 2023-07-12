import { CircularPlacementSettings, GraphLayout } from '@/types/settings';
import { arrangeGraphComponents } from '@/utils/placement/shared';

import placeVerticesOnCircle from './circle.placement';

const placeVerticesOnCircles = (
  components: Array<Array<string>>,
  vertexRadius: number,
  settings: CircularPlacementSettings
): GraphLayout => {
  'worklet';
  console.log('>>>', components);
  return arrangeGraphComponents(
    components.map(vertices =>
      placeVerticesOnCircle(vertices, vertexRadius, settings)
    ),
    vertexRadius
  );
};

export default placeVerticesOnCircles;

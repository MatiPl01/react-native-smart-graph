import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { GraphComponents } from '@/types/graphs';
import { CircularPlacementSettings, GraphLayout } from '@/types/settings';
import { arrangeGraphComponents } from '@/utils/placement/shared';

import placeVerticesOnCircle from './circle.placement';

export default function placeVerticesOnCircles(
  components: GraphComponents,
  vertexRadius: number,
  settings: CircularPlacementSettings
): GraphLayout {
  'worklet';
  return arrangeGraphComponents(
    components.map(component =>
      placeVerticesOnCircle(component, vertexRadius, settings)
    ),
    settings.minVertexSpacing ?? SHARED_PLACEMENT_SETTINGS.minVertexSpacing
  );
}

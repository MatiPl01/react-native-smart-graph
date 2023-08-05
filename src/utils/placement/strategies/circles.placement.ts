import { GraphComponents } from '@/types/graphs';
import {
  CircularPlacementSettingsWithDefaults,
  GraphLayout
} from '@/types/settings';
import { arrangeGraphComponents } from '@/utils/placement/shared';

import placeVerticesOnCircle from './circle.placement';

export default function placeVerticesOnCircles(
  components: GraphComponents,
  vertexRadius: number,
  settings: CircularPlacementSettingsWithDefaults
): GraphLayout {
  'worklet';
  return arrangeGraphComponents(
    components.map(component =>
      placeVerticesOnCircle(component, vertexRadius, settings)
    ),
    settings.minVertexSpacing
  );
}

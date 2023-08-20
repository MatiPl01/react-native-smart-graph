import { GraphComponents } from '@/types/models';
import { AllCirclesPlacementSettings, GraphLayout } from '@/types/settings';
import { arrangeGraphComponents } from '@/utils/placement/shared';

import placeVerticesOnCircle from './circle.placement';

export default function placeVerticesOnCircles(
  components: GraphComponents,
  settings: AllCirclesPlacementSettings
): GraphLayout {
  'worklet';
  return arrangeGraphComponents(
    components.map(component => placeVerticesOnCircle(component, settings)),
    settings.minVertexDistance
  );
}

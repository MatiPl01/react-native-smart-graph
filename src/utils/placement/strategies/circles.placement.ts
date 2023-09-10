import { GraphComponents } from '@/types/models';
import { AllCirclesPlacementSettings, GraphLayout } from '@/types/settings';
import { arrangeGraphComponents } from '@/utils/placement/shared';

import placeVerticesOnCircle from './circle.placement';

const placeVerticesOnCircles = (
  components: GraphComponents,
  settings: AllCirclesPlacementSettings
): GraphLayout => {
  'worklet';
  return arrangeGraphComponents(
    components.map(component => placeVerticesOnCircle(component, settings)),
    settings.minVertexDistance
  );
};

// The export declaration must be at the end of the file
// to ensure that babel can properly transform the file
// to the commonjs format (worklets cannot be reordered)
export default placeVerticesOnCircles;

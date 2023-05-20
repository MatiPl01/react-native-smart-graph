import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { DirectedCurvedEdgeComponentProps } from '@/types/components/edges';
import { getEdgeIndex } from '@/utils/graphs/layout';
import {
  animatedVectorToVector,
  calcOrthogonalUnitVector,
  translateAlongVector
} from '@/utils/vectors';

import EdgeArrowComponent from '../../arrows/EdgeArrowComponent';
import EdgeLabelComponent from '../../labels/EdgeLabelComponent';

export default function DirectedCurvedEdgeComponent<E, V>({
  v1Position,
  v2Position,
  vertexRadius,
  edge,
  edgesBetweenVertices,
  renderers,
  settings,
  animationProgress,
  removed
}: DirectedCurvedEdgeComponentProps<E, V>) {
  const edgesCount = edgesBetweenVertices.length;
  const edgeIndex = getEdgeIndex(edge, edgesBetweenVertices);

  // Parabola vertex
  const parabolaVertex = useSharedValue({
    x: (v1Position.x.value + v2Position.x.value) / 2,
    y: (v1Position.y.value + v2Position.y.value) / 2
  });
  // Edge label
  const maxLabelSize = useSharedValue(10); // TODO - calculate this
  // Edge arrow
  const dirVec = useSharedValue({ x: 0, y: 0 }); // TODO - calculate this
  const arrowTipPosition = useSharedValue({ x: 0, y: 0 }); // TODO - calculate this
  const maxArrowWidth = useSharedValue(10); // TODO - calculate this
  // Edge curve path
  const path = useDerivedValue(() => {
    const controlPoint = {
      x:
        parabolaVertex.value.x * 2 -
        (v1Position.x.value + v2Position.x.value) / 2,
      y:
        parabolaVertex.value.y * 2 -
        (v1Position.y.value + v2Position.y.value) / 2
    };

    // Create the SVG path string with the 'Q' command for a quadratic curve
    const pathString = `M${v1Position.x.value},${v1Position.y.value} Q${controlPoint.x},${controlPoint.y} ${v2Position.x.value},${v2Position.y.value}`;

    return pathString;
  });

  useAnimatedReaction(
    () => ({
      center: {
        x: (v1Position.x.value + v2Position.x.value) / 2,
        y: (v1Position.y.value + v2Position.y.value) / 2
      }
    }),
    ({ center }) => {
      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(
        animatedVectorToVector(v1Position),
        animatedVectorToVector(v2Position)
      );
      const offset = 20 * (edgeIndex - (edgesCount - 1) / 2); // TODO - make this configurable
      const parabolaVertexPosition = translateAlongVector(
        center,
        orthogonalUnitVector,
        offset
      );
      parabolaVertex.value = parabolaVertexPosition;

      // Calculate the edge arrow tip position
    }
  );

  const sharedProps = {
    animationProgress,
    removed
  };

  return (
    <>
      {renderers.edge({
        ...sharedProps,
        key: edge.key,
        data: edge.value,
        parabolaVertex,
        path
      })}
      <EdgeArrowComponent
        {...sharedProps}
        directionVector={dirVec}
        tipPosition={arrowTipPosition}
        renderer={renderers.arrow}
        vertexRadius={vertexRadius}
        maxWidth={maxArrowWidth}
      />
      {renderers.label && (
        <EdgeLabelComponent
          {...sharedProps}
          edge={edge}
          v1Position={v1Position}
          v2Position={v2Position}
          vertexRadius={vertexRadius}
          centerPosition={parabolaVertex}
          maxSize={maxLabelSize}
          renderer={renderers.label}
          // TODO -  pass label settings to the label component
        />
      )}
    </>
  );
}

import { memo } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { DEFAULT_LABEL_COMPONENT_SETTINGS } from '@/constants/components';
import { UndirectedCurvedEdgeComponentProps } from '@/types/components/edges';
import {
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  translateAlongVector
} from '@/utils/vectors';

function UndirectedCurvedEdgeComponent<V, E>({
  animatedEdgesCount,
  animatedOrder,
  animationProgress,
  componentSettings,
  edge,
  labelHeight,
  labelPosition,
  renderers,
  v1Position,
  v1Radius,
  v2Position,
  v2Radius
}: UndirectedCurvedEdgeComponentProps<V, E>) {
  const v1Key = edge.vertices[0].key;
  const v2Key = edge.vertices[1].key;

  // Parabola vertex
  const parabolaX = useSharedValue(
    (v1Position.x.value + v2Position.x.value) / 2
  );
  const parabolaY = useSharedValue(
    (v1Position.y.value + v2Position.y.value) / 2
  );

  // Edge label
  useAnimatedReaction(
    () => ({ r1: v1Radius.value, r2: v2Radius.value }),
    ({ r1, r2 }) => {
      labelHeight.value =
        ((r1 + r2) / 2) *
        (componentSettings.label?.scale ??
          DEFAULT_LABEL_COMPONENT_SETTINGS.scale);
    },
    [componentSettings.label?.scale]
  );

  useAnimatedReaction(
    () => {
      const offset =
        labelHeight.value *
        (animatedOrder.value - (animatedEdgesCount.value - 1) / 2);
      // Ensure that the order of edges is always the same
      // no matter which vertex was specified first on the edge
      // vertices array
      if (v1Key.localeCompare(v2Key) > 0) {
        return { offset, v1: v2Position, v2: v1Position };
      }
      return { offset, v1: v1Position, v2: v2Position };
    },
    ({ offset, v1, v2 }) => {
      // Calculate the parabola vertex position
      const orthogonalUnitVector = calcOrthogonalUnitVector(
        animatedVectorCoordinatesToVector(v1),
        animatedVectorCoordinatesToVector(v2)
      );
      const { x, y } = translateAlongVector(
        {
          x: (v1.x.value + v2.x.value) / 2,
          y: (v1.y.value + v2.y.value) / 2
        },
        orthogonalUnitVector,
        offset
      );
      labelPosition.x.value = parabolaX.value = x;
      labelPosition.y.value = parabolaY.value = y;
    }
  );

  // Edge curve path
  const path = useDerivedValue(() => {
    const controlPoint = {
      x: parabolaX.value * 2 - (v1Position.x.value + v2Position.x.value) / 2,
      y: parabolaY.value * 2 - (v1Position.y.value + v2Position.y.value) / 2
    };

    // Create the SVG path string with the 'Q' command for a quadratic curve
    const pathString = `M${v1Position.x.value},${v1Position.y.value} Q${controlPoint.x},${controlPoint.y} ${v2Position.x.value},${v2Position.y.value}`;

    return pathString;
  });

  return (
    <>
      {renderers.edge({
        animationProgress,
        key: edge.key,
        parabolaX,
        parabolaY,
        path,
        value: edge.value
      })}
    </>
  );
}

export default memo(UndirectedCurvedEdgeComponent) as <V, E>(
  props: UndirectedCurvedEdgeComponentProps<V, E>
) => JSX.Element;

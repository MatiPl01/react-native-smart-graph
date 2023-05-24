import { memo, useEffect } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { LABEL_COMPONENT_SETTINGS } from '@/constants/components';
import { UndirectedCurvedEdgeComponentProps } from '@/types/components/edges';
import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  animatedVectorCoordinatesToVector,
  calcOrthogonalUnitVector,
  translateAlongVector
} from '@/utils/vectors';

import EdgeLabelComponent from '../../labels/EdgeLabelComponent';

function UndirectedCurvedEdgeComponent<E, V>({
  v1Position,
  v2Position,
  vertexRadius,
  edge,
  animatedOrder,
  animatedEdgesCount,
  settings,
  renderers,
  animationProgress,
  onLabelRender
}: UndirectedCurvedEdgeComponentProps<E, V>) {
  const v1Key = edge.vertices[0].key;
  const v2Key = edge.vertices[1].key;

  // Edge label
  const labelHeight = useSharedValue(
    vertexRadius *
      (settings.label?.sizeRatio || LABEL_COMPONENT_SETTINGS.sizeRatio)
  );
  // Parabola vertex
  const parabolaVertex = useDerivedValue(() => {
    let v1: AnimatedVectorCoordinates, v2: AnimatedVectorCoordinates;

    // Ensure that the order of edges is always the same
    // no matter which vertex was specified first on the edge
    // vertices array
    if (v1Key.localeCompare(v2Key) > 0) {
      v1 = v2Position;
      v2 = v1Position;
    } else {
      v1 = v1Position;
      v2 = v2Position;
    }

    // Calculate the parabola vertex position
    const orthogonalUnitVector = calcOrthogonalUnitVector(
      animatedVectorCoordinatesToVector(v1),
      animatedVectorCoordinatesToVector(v2)
    );
    const offset =
      labelHeight.value *
      (animatedOrder.value - (animatedEdgesCount.value - 1) / 2);
    return translateAlongVector(
      {
        x: (v1.x.value + v2.x.value) / 2,
        y: (v1.y.value + v2.y.value) / 2
      },
      orthogonalUnitVector,
      offset
    );
  });

  useEffect(() => {
    onLabelRender?.(edge.key, parabolaVertex);
  }, [edge.key]);

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

  return (
    <>
      {renderers.edge({
        key: edge.key,
        data: edge.value,
        parabolaVertex,
        path,
        animationProgress
      })}
      {renderers.label && (
        <EdgeLabelComponent
          edge={edge}
          v1Position={v1Position}
          v2Position={v2Position}
          vertexRadius={vertexRadius}
          centerPosition={parabolaVertex}
          height={labelHeight}
          renderer={renderers.label}
          animationProgress={animationProgress}
        />
      )}
    </>
  );
}

export default memo(UndirectedCurvedEdgeComponent) as <E, V>(
  props: UndirectedCurvedEdgeComponentProps<E, V>
) => JSX.Element;

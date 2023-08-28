import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { ArrowComponent } from '@/components/graphs/arrows';
import { DirectedStraightEdgeComponentProps } from '@/types/components';
import { calcUnitVector, translateAlongVector } from '@/utils/vectors';

import StraightEdgeComponent from './StraightEdgeComponent';
import { useStraightEdge } from './utils';

const calcTranslationOffset = (
  order: number,
  edgesCount: number,
  maxOffsetFactor: number,
  vertexRadius: number
): number => {
  'worklet';
  const maxTranslationOffset = maxOffsetFactor * vertexRadius;
  return edgesCount >= 2
    ? (1 - order / ((edgesCount - 1) / 2)) * maxTranslationOffset
    : maxTranslationOffset * (edgesCount - 1);
};

function DirectedStraightEdgeComponent<V, E>(
  props: DirectedStraightEdgeComponentProps<V, E>
) {
  const {
    data: { animationProgress, key, value },
    renderers,
    settings: {
      arrow: { scale: arrowScale },
      vertex: { radius: vertexRadius }
    }
  } = props;

  // ARROW COMPONENT PROPS
  const arrowTransform = useSharedValue({
    dirVector: { x: 0, y: 0 },
    scale: 0,
    tipPosition: { x: 0, y: 0 }
  });

  const { p1, p2 } = useStraightEdge(
    props,
    calcTranslationOffset,
    // Additional settings for the arrow component
    () => ({
      arrowScale
    }),
    ({
      customProps: { arrowScale: scale },
      transform: {
        edge: { offset, p1: v1, p2: v2 },
        label: { scale: labelScale }
      },
      vertexScale
    }) => {
      'worklet';
      // Update the arrow component props
      const distance = Math.sqrt(
        (vertexScale * vertexRadius) ** 2 - offset ** 2
      );
      const dirVector = calcUnitVector(v1, v2);
      arrowTransform.value = {
        dirVector,
        scale: Math.min(scale, labelScale),
        tipPosition: translateAlongVector(v2, dirVector, -distance)
      };
    }
  );

  return (
    <>
      <StraightEdgeComponent
        animationProgress={animationProgress}
        edgeKey={key}
        p1={p1}
        p2={p2}
        renderer={renderers.edge}
        value={value}
      />
      <ArrowComponent
        animationProgress={animationProgress}
        renderer={renderers.arrow}
        transform={arrowTransform}
        vertexRadius={vertexRadius}
      />
    </>
  );
}

export default memo(
  DirectedStraightEdgeComponent
) as typeof DirectedStraightEdgeComponent;

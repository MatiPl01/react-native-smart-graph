import { Transforms2d } from '@shopify/react-native-skia';
import { memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { EdgeArrowComponent } from '@/components/graphs/arrows';
import { calcEdgeArrowTransform } from '@/components/graphs/arrows/utils';
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
    focusProgress,
    renderers: { arrow: edgeArrowRenderer, edge: edgeRenderer },
    settings: {
      arrow: { scale: arrowScale },
      vertex: { radius: vertexRadius }
    }
  } = props;

  // ARROW COMPONENT PROPS
  const arrowTransform = useSharedValue<Transforms2d>([{ scale: 0 }]);

  const { p1, p2 } = useStraightEdge(
    props,
    calcTranslationOffset,
    // Additional settings for the arrow component
    edgeArrowRenderer
      ? [
          () => ({
            arrowScale
          }),
          ({
            customProps: { arrowScale: aScale },
            transform: {
              edge: { offset, p1: v1, p2: v2 },
              label: { scale: labelScale }
            }
          }) => {
            'worklet';
            // Update the arrow component props
            const distance = Math.sqrt(vertexRadius ** 2 - offset ** 2);
            const dirVector = calcUnitVector(v1, v2);
            arrowTransform.value = calcEdgeArrowTransform(
              translateAlongVector(v2, dirVector, -distance),
              dirVector,
              Math.min(aScale, labelScale),
              vertexRadius
            );
          }
        ]
      : undefined
  );

  return (
    <>
      <StraightEdgeComponent
        animationProgress={animationProgress}
        edgeKey={key}
        focusProgress={focusProgress}
        p1={p1}
        p2={p2}
        renderer={edgeRenderer}
        value={value as E}
      />
      {edgeArrowRenderer && (
        <EdgeArrowComponent
          animationProgress={animationProgress}
          renderer={edgeArrowRenderer}
          transform={arrowTransform}
          vertexRadius={vertexRadius}
        />
      )}
    </>
  );
}

export default memo(
  DirectedStraightEdgeComponent
) as typeof DirectedStraightEdgeComponent;

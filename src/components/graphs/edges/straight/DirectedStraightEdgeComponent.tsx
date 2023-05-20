import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { DirectedStraightEdgeComponentProps } from '@/types/components/edges';
import { DirectedEdge } from '@/types/graphs';
import {
  animatedVectorToVector,
  calcOrthogonalUnitVector,
  calcUnitVector,
  multiplyVector,
  translateAlongVector
} from '@/utils/vectors';

import EdgeArrowComponent from '../../arrows/EdgeArrowComponent';
import EdgeLabelComponent from '../../labels/EdgeLabelComponent';

const getEdgeIndex = <E, V>(
  edge: DirectedEdge<E, V>,
  edgesBetweenVertices: Array<DirectedEdge<E, V>>
): number => {
  let index = 0;
  for (const e of edgesBetweenVertices) {
    if (e.key === edge.key) {
      break;
    }
    if (e.source.key === edge.source.key && e.target.key === edge.target.key) {
      index++;
    }
  }
  return index;
};

export default function DirectedStraightEdgeComponent<E, V>({
  v1Position,
  v2Position,
  edge,
  vertexRadius,
  settings,
  edgesBetweenVertices,
  animationProgress,
  removed,
  renderers
}: DirectedStraightEdgeComponentProps<E, V>) {
  const edgesCount = edgesBetweenVertices.length;
  const edgeIndex = getEdgeIndex(edge, edgesBetweenVertices);
  // Edge line
  const p1 = useSharedValue({
    x: v1Position.x.value,
    y: v1Position.y.value
  });
  const p2 = useSharedValue({
    x: v2Position.x.value,
    y: v2Position.y.value
  });
  // Edge arrow
  const dirVec = useDerivedValue(() => calcUnitVector(p2.value, p1.value));
  const arrowTipPosition = useSharedValue(p2.value);
  const maxArrowWidth = useSharedValue(0);
  // Edge label
  const center = useDerivedValue(() => ({
    x: (p1.value.x + p2.value.x) / 2,
    y: (p1.value.y + p2.value.y) / 2
  }));
  const maxLabelSize = useSharedValue(0);

  useAnimatedReaction(
    () => ({
      v1: animatedVectorToVector(v1Position),
      v2: animatedVectorToVector(v2Position)
    }),
    ({ v1, v2 }) => {
      const maxTranslationOffset = settings.maxOffsetFactor * vertexRadius;
      const translationOffset =
        edgesCount > 1
          ? (1 - edgeIndex / ((edgesCount - 1) / 2)) * maxTranslationOffset
          : 0;
      const translationVector = multiplyVector(
        calcOrthogonalUnitVector(v1, v2),
        translationOffset
      );
      // Update edge line points positions
      p1.value = {
        x: v1.x + translationVector.x,
        y: v1.y + translationVector.y
      };
      p2.value = {
        x: v2.x + translationVector.x,
        y: v2.y + translationVector.y
      };
      // Update edge arrow tip position
      arrowTipPosition.value = translateAlongVector(
        p2.value,
        dirVec.value,
        Math.sqrt(vertexRadius ** 2 - translationOffset ** 2)
      );
      const maxSize =
        2 *
        (edgesCount === 1
          ? maxTranslationOffset
          : maxTranslationOffset / (edgesCount - 1));
      // Update edge label max size
      maxLabelSize.value = maxSize;
      // Update edge arrow max size
      maxArrowWidth.value = maxSize;
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
        p1,
        p2
      })}
      {renderers.arrow && (
        <EdgeArrowComponent
          {...sharedProps}
          directionVector={dirVec}
          tipPosition={arrowTipPosition}
          renderer={renderers.arrow}
          vertexRadius={vertexRadius}
          maxWidth={maxArrowWidth}
        />
      )}
      {renderers.label && (
        <EdgeLabelComponent
          {...sharedProps}
          edge={edge}
          p1={p1}
          p2={p2}
          vertexRadius={vertexRadius}
          centerPosition={center}
          maxSize={maxLabelSize}
          renderer={renderers.label}
        />
      )}
    </>
  );
}

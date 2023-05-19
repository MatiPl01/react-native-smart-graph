import { useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { DirectedStraightEdgeComponentProps } from '@/types/components/edges';
import { DirectedEdge } from '@/types/graphs';

const getEdgeIndex = <E, V>(
  edge: DirectedEdge<E, V>,
  edgesBetween: Array<DirectedEdge<E, V>>
): number => {
  // TODO - improve (display edge that have the same direction near to each other and the opposite edges after them)
  return edgesBetween.findIndex(e => e.key === edge.key);
};

export default function DirectedStraightEdgeComponent<E, V>({
  v1Position,
  v2Position,
  edge,
  vertexRadius,
  settings,
  edgesBetween,
  animationProgress,
  removed,
  renderers
}: DirectedStraightEdgeComponentProps<E, V>) {
  const edgeIndex = useMemo(
    () => getEdgeIndex(edge, edgesBetween),
    [edge, edgesBetween]
  );
  const edgesCount = edgesBetween.length;

  console.log('edgeIndex', edgeIndex, 'edgesCount', edgesCount);

  const p1 = useDerivedValue(() => ({
    x:
      v1Position.x.value +
      ((edgeIndex - Math.floor(edgesCount / 2)) / (edgesCount / 2)) *
        vertexRadius,
    y: v1Position.y.value
  }));
  const p2 = useDerivedValue(() => ({
    x: v2Position.x.value,
    y: v2Position.y.value
  }));

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
    </>
  );
}

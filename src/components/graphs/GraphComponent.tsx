import { useEffect, useMemo } from 'react';

import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';

import FONTS from '@/assets/fonts';
import { Graph } from '@/types/graphs';
import { PlacementSettings } from '@/types/placement';
import { placeVertices } from '@/utils/placement';

export type MeasureEvent = {
  // TODO - remove this
  layout: {
    width: number;
    height: number;
  };
};

export type TempProps = {
  // TODO - remove this
  onMeasure: (event: MeasureEvent) => void;
};

type GraphComponentProps<V, E> = {
  graph: Graph<V, E>;
  placementSettings?: PlacementSettings<V, E>;
};

export default function GraphComponent<V, E>({
  graph,
  onMeasure,
  placementSettings
}: GraphComponentProps<V, E> & TempProps) {
  const font = useFont(FONTS.rubikFont, 10);
  const graphLayout = useMemo(
    () => placeVertices(graph, placementSettings),
    [graph]
  );
  useEffect(() => {
    onMeasure({
      layout: {
        width: graphLayout.width,
        height: graphLayout.height
      }
    });
  }, [graphLayout]);
  if (font === null) {
    return null;
  }
  return (
    <Group>
      {Object.entries(graphLayout.verticesPositions).map(([key, { x, y }]) => (
        <Group key={key}>
          <Circle key={key} cx={x} cy={y} r={5} color='lightblue' />
          <Text x={x} y={y} text={key} font={font} />
        </Group>
      ))}
    </Group>
  );
}

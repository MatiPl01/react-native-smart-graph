import { useEffect, useMemo } from 'react';

import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';

import rubikFont from '@/assets/fonts/Rubik-Regular.ttf';
import { DirectedGraph } from '@/models/graphs';
import { PlacementSettings } from '@/types/placement';
import { placeVertices } from '@/utils/placement';

type MeasureEvent = {
  // TODO - remove this
  layout: {
    width: number;
    height: number;
  };
};

type DirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; from: string; to: string; data: E }>;
  placementSettings?: PlacementSettings<V, E>;
};

export type TestProps = {
  // TODO - remove this
  onMeasure: (event: MeasureEvent) => void;
};

function DirectedGraphComponent<V, E>({
  vertices,
  edges,
  placementSettings,
  onMeasure
}: DirectedGraphComponentProps<V, E> & TestProps) {
  const graph = useMemo(() => {
    const g = new DirectedGraph<V, E>();

    vertices.forEach(({ key, data }) => {
      g.insertVertex(key, data);
    });

    edges.forEach(({ key, from, to, data }) => {
      g.insertEdge(from, to, key, data);
    });
    return g;
  }, [vertices, edges]);

  const graphLayout = useMemo(
    () => placeVertices(graph, placementSettings),
    [graph]
  );

  const font = useFont(rubikFont, 10);

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

export default <V, E>(props: DirectedGraphComponentProps<V, E>) => {
  return (
    <DirectedGraphComponent
      {...(props as DirectedGraphComponentProps<V, E> & TestProps)}
    />
  );
};

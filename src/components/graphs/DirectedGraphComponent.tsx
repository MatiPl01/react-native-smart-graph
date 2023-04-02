import {useEffect, useMemo} from 'react';

import { DirectedGraph } from '@/models/graphs';
import { PlacementStrategy } from '@/types/placement';
import {placeVertices} from '@/utils/placement.utils';
import {Circle, Group} from '@shopify/react-native-skia';

type MeasureEvent = { // TODO - remove this
  layout: {
    width: number;
    height: number;
  };
};


type DirectedGraphComponentProps<V, E> = {
  vertices: Array<{ key: string; data: V }>;
  edges: Array<{ key: string; from: string; to: string; data: E }>;
  placementStrategy?: PlacementStrategy;
};

export type TestProps = { // TODO - remove this
  onMeasure: (event: MeasureEvent) => void;
};

function DirectedGraphComponent<V, E>({
  vertices,
  edges,
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

  useEffect(() => {
    onMeasure({layout: {
      width: 200,
      height: 200
    }});
  }, []);

  const positions = useMemo(() => placeVertices(graph, 200, 200, 'rings'), [graph]);

  return <Group>
    {Object.entries(positions).map(([key, {x, y}]) => <Circle key={key} cx={x} cy={y} r={5} color='lightblue' />) }
  </Group>;
}

export default <V, E>(props: DirectedGraphComponentProps<V, E>) => {
  return <DirectedGraphComponent {...(props as DirectedGraphComponentProps<V, E> & TestProps)} />;
};

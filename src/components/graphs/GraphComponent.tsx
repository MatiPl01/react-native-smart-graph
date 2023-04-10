import { useCallback, useEffect, useMemo, useRef } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { Group } from '@shopify/react-native-skia';

import { Graph } from '@/types/graphs';
import { PlacementSettings } from '@/types/placement';
import { EdgeRendererProps, VertexRendererProps } from '@/types/render';
import { placeVertices } from '@/utils/placement';
import { SHARED as SHARED_PLACEMENT_SETTINGS } from '@/utils/placement/constants';

import EdgeComponent from './edges/EdgeComponent';
import VertexComponent from './vertices/VertexComponent';

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

export type SharedGraphComponentProps<V> = {
  vertexRenderer: (props: VertexRendererProps<V>) => JSX.Element;
};

type GraphComponentProps<
  V,
  E,
  R extends EdgeRendererProps<E, V>
> = SharedGraphComponentProps<V> & {
  graph: Graph<V, E>;
  placementSettings?: PlacementSettings<V, E>;
  edgeRenderer: (props: R) => JSX.Element;
};

export default function GraphComponent<
  V,
  E,
  R extends EdgeRendererProps<E, V>
>({
  graph,
  onMeasure,
  placementSettings,
  vertexRenderer,
  edgeRenderer
}: GraphComponentProps<V, E, R> & TempProps) {
  const verticesPositionsRef = useRef<
    Record<string, { x: SharedValue<number>; y: SharedValue<number> }>
  >({});

  const memoPlacementSettings = useMemo(
    () =>
      ({
        ...SHARED_PLACEMENT_SETTINGS,
        ...placementSettings
      } as Required<PlacementSettings<V, E>>),
    [placementSettings]
  );

  const graphLayout = useMemo(
    () => placeVertices(graph, memoPlacementSettings),
    [graph]
  );

  const memoVertexRenderer = useCallback(vertexRenderer, [vertexRenderer]);
  const memoEdgeRenderer = useCallback(edgeRenderer, [edgeRenderer]);

  useEffect(() => {
    // TODO - improve this
    onMeasure({
      layout: {
        width: graphLayout.width,
        height: graphLayout.height
      }
    });
  }, [graphLayout]);

  const setAnimatedVertexPosition = useCallback(
    (
      key: string,
      position: { x: SharedValue<number>; y: SharedValue<number> }
    ) => {
      verticesPositionsRef.current[key] = position;
    },
    [verticesPositionsRef.current]
  );

  return (
    <Group>
      {graph.edges.map(edge => (
        <EdgeComponent
          key={edge.key}
          edge={edge}
          // TODO - use animated positions instead of static ones
          verticesPositions={graphLayout.verticesPositions}
          edgeRenderer={memoEdgeRenderer}
        />
      ))}
      {Object.entries(graphLayout.verticesPositions).map(
        ([key, placementPosition]) => (
          <VertexComponent
            key={key}
            vertex={graph.vertex(key)}
            radius={memoPlacementSettings.vertexRadius}
            placementPosition={placementPosition}
            vertexRenderer={memoVertexRenderer}
            setAnimatedPosition={setAnimatedVertexPosition}
          />
        )
      )}
    </Group>
  );
}

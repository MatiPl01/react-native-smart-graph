import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Group } from '@shopify/react-native-skia';

import { Graph } from '@/types/graphs';
import { PlacementSettings } from '@/types/placement';
import {
  DirectedEdgeRenderFunction,
  EdgeRendererProps,
  VertexRenderFunction
} from '@/types/render';
import { placeVertices } from '@/utils/placement';
import { SHARED as SHARED_PLACEMENT_SETTINGS } from '@/utils/placement/constants';

import EdgeComponent from './edges/EdgeComponent';
import DefaultEdgeArrowRenderer from './renderers/DefaultEdgeArrowRenderer';
import DefaultEdgeRenderer from './renderers/DefaultEdgeRenderer';
import DefaultVertexRenderer from './renderers/DefaultVertexRenderer';
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
  vertexRenderer?: VertexRenderFunction<V>;
};

type GraphComponentProps<
  V,
  E,
  R extends EdgeRendererProps<E>
> = SharedGraphComponentProps<V> & {
  graph: Graph<V, E>;
  placementSettings?: PlacementSettings<V, E>;
  edgeRenderer?: (props: R) => JSX.Element | null;
  edgeLabelRenderer?: (props: R) => JSX.Element | null;
  edgeArrowRenderer?: DirectedEdgeRenderFunction<E>;
};

export default function GraphComponent<V, E, R extends EdgeRendererProps<E>>({
  graph,
  onMeasure,
  placementSettings,
  vertexRenderer = DefaultVertexRenderer,
  edgeRenderer = DefaultEdgeRenderer,
  edgeLabelRenderer,
  edgeArrowRenderer = DefaultEdgeArrowRenderer
}: GraphComponentProps<V, E, R> & TempProps) {
  const [areAllVerticesRendered, setAreAllVerticesRendered] = useState(false);

  const renderedVerticesCountRef = useRef(0);
  const verticesPositionsRef = useRef<
    Record<
      string,
      {
        x: SharedValue<number>;
        y: SharedValue<number>;
      }
    >
  >({});

  const memoPlacementSettings = useMemo(
    () =>
      ({
        ...SHARED_PLACEMENT_SETTINGS,
        ...placementSettings
      } as Required<PlacementSettings<V, E>>),
    [placementSettings]
  );

  const graphLayout = useMemo(() => {
    renderedVerticesCountRef.current = 0;

    return {
      ...placeVertices(graph, memoPlacementSettings),
      verticesCount: graph.vertices.length
    };
  }, [graph]);

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

      if (++renderedVerticesCountRef.current === graphLayout.verticesCount) {
        setAreAllVerticesRendered(true);

        const center = {
          x: graphLayout.width / 2,
          y: graphLayout.height / 2
        };

        Object.values(verticesPositionsRef.current).forEach(({ x, y }) => {
          x.value = withRepeat(
            withTiming(x.value + 1.25 * (x.value - center.x), {
              duration: 1000
            }),
            Infinity,
            true
          );
          y.value = withRepeat(
            withTiming(y.value + 1.25 * (y.value - center.y), {
              duration: 1000
            }),
            Infinity,
            true
          );
        });
      }
    },
    [verticesPositionsRef.current]
  );

  return (
    <Group>
      {areAllVerticesRendered &&
        graph.edges.map(edge => (
          <EdgeComponent
            key={edge.key}
            edge={edge}
            verticesPositions={verticesPositionsRef.current}
            edgeRenderer={memoEdgeRenderer}
            edgeArrowRenderer={edgeArrowRenderer}
          />
        ))}
      {Object.entries(graphLayout.verticesPositions).map(
        ([key, placementPosition]) => (
          <VertexComponent
            key={key}
            vertex={graph.vertex(key)}
            radius={memoPlacementSettings.vertexRadius}
            placementPosition={placementPosition}
            setAnimatedPosition={setAnimatedVertexPosition}
            vertexRenderer={memoVertexRenderer}
          />
        )
      )}
    </Group>
  );
}

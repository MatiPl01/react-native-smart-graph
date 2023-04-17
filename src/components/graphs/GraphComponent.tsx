import { useCallback, useMemo, useRef, useState } from 'react';
import {
  useDerivedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

import { Group, Rect } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedPositionCoordinates
} from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings } from '@/types/settings';
import { placeVertices } from '@/utils/placement';

import EdgeComponent, { EdgeComponentProps } from './edges/EdgeComponent';
import DefaultEdgeArrowRenderer from './renderers/DefaultEdgeArrowRenderer';
import DefaultEdgeRenderer from './renderers/DefaultEdgeRenderer';
import DefaultVertexRenderer from './renderers/DefaultVertexRenderer';
import VertexComponent from './vertices/VertexComponent';

export type GraphComponentPrivateProps = {
  boundingRect: AnimatedBoundingRect;
};

type GraphComponentProps<
  V,
  E,
  S extends GraphSettings<V, E>,
  R extends GraphRenderers<V, E>
> = {
  graph: Graph<V, E>;
  settings?: S;
  renderers?: R;
};

export default function GraphComponent<
  V,
  E,
  S extends GraphSettings<V, E>,
  R extends GraphRenderers<V, E>
>({
  graph,
  settings,
  renderers,
  boundingRect
}: GraphComponentProps<V, E, S, R> & GraphComponentPrivateProps) {
  const { x1, x2, y1, y2 } = boundingRect;
  const [areAllVerticesRendered, setAreAllVerticesRendered] = useState(false);

  const renderedVerticesCountRef = useRef(0);
  const verticesPositionsRef = useRef<
    Record<string, AnimatedPositionCoordinates>
  >({});

  const boundingVertices = useMemo<
    Record<keyof AnimatedBoundingRect, string | null>
  >(
    () => ({
      x1: null,
      x2: null,
      y1: null,
      y2: null
    }),
    []
  );

  const memoSettings = useMemo(
    () => ({
      ...settings,
      components: {
        ...settings?.components,
        vertex: {
          ...VERTEX_COMPONENT_SETTINGS,
          ...settings?.components?.vertex
        },
        edge: {
          ...settings?.components?.edge
        }
      }
    }),
    [settings]
  );

  const memoRenderers = useMemo(
    () => ({
      vertex: DefaultVertexRenderer,
      edge: {
        arrow: graph.isDirected() ? DefaultEdgeArrowRenderer : undefined,
        edge: DefaultEdgeRenderer,
        label: renderers?.edgeLabel
      }
    }),
    [renderers]
  );

  const graphLayout = useMemo(() => {
    renderedVerticesCountRef.current = 0;

    const layout = placeVertices(
      graph,
      memoSettings.components.vertex.radius,
      memoSettings.placement
    );

    x1.value = 0;
    y1.value = 0;
    x2.value = layout.width;
    y2.value = layout.height;

    return {
      ...layout,
      verticesCount: graph.vertices.length
    };
  }, [graph]);

  const setAnimatedVertexPosition = useCallback(
    (key: string, position: AnimatedPositionCoordinates) => {
      verticesPositionsRef.current[key] = position;

      if (++renderedVerticesCountRef.current === graphLayout.verticesCount) {
        setAreAllVerticesRendered(true);

        const center = {
          x: graphLayout.width / 2,
          y: graphLayout.height / 2
        };

        Object.values(verticesPositionsRef.current)
          // .slice(0, 1)
          // .slice(1, 2)
          // .slice(2, 3)
          // .slice(0, 2)
          // .slice(1, 3)
          // .slice(0, 3)
          // .slice(1, 4)
          .forEach(({ x, y }) => {
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

  const renderEdges = useCallback(() => {
    return graph.edges.map(edge => (
      <EdgeComponent
        key={edge.key}
        {...({
          edge,
          verticesPositions: verticesPositionsRef.current,
          renderers: memoRenderers.edge,
          settings: memoSettings.components.edge
        } as EdgeComponentProps<E, V>)}
      />
    ));
  }, [graph]);

  const renderVertices = useCallback(
    () =>
      Object.entries(graphLayout.verticesPositions).map(
        ([key, placementPosition]) => (
          <VertexComponent<V, E>
            key={key}
            vertex={graph.vertex(key)}
            settings={memoSettings.components.vertex}
            placementPosition={placementPosition}
            containerBoundingRect={boundingRect}
            boundingVertices={boundingVertices}
            renderer={memoRenderers.vertex}
            setAnimatedPosition={setAnimatedVertexPosition}
          />
        )
      ),
    [graphLayout, graph]
  );

  // TODO - remove this
  const containerWidth = useDerivedValue(() => x2.value - x1.value, [x1, x2]);
  const containerHeight = useDerivedValue(() => y2.value - y1.value, [y1, y2]);

  return (
    <Group>
      <Rect
        x={x1}
        y={y1}
        width={containerWidth}
        height={containerHeight}
        color='#444'
      />
      <Rect
        x={0}
        y={0}
        width={graphLayout.width}
        height={graphLayout.height}
        color='#333'
      />
      {areAllVerticesRendered && renderEdges()}
      {renderVertices()}
    </Group>
  );
}

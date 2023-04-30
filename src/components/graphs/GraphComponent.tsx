import { useAnimationFrame } from '@/hooks';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { Group, Rect } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedBoundingVertices,
  AnimatedPositionCoordinates
} from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings } from '@/types/settings';
import applyDefaultForces from '@/utils/forces/strategies/default.forces';
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
  const { top, bottom, right, left } = boundingRect;
  const [areAllVerticesRendered, setAreAllVerticesRendered] = useState(false);

  const [_, setIsAnimating] = useAnimationFrame(() =>
    applyDefaultForces(graphConnections, verticesPositionsRef.current)
  );

  const topVertexKey = useSharedValue<string | null>(null);
  const bottomVertexKey = useSharedValue<string | null>(null);
  const leftVertexKey = useSharedValue<string | null>(null);
  const rightVertexKey = useSharedValue<string | null>(null);

  const renderedVerticesCountRef = useRef(0);
  const verticesPositionsRef = useRef<
    Record<string, AnimatedPositionCoordinates>
  >({});

  const boundingVertices: AnimatedBoundingVertices = {
    top: topVertexKey,
    bottom: bottomVertexKey,
    left: leftVertexKey,
    right: rightVertexKey
  };

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

    top.value = 0;
    left.value = 0;
    right.value = layout.width;
    bottom.value = layout.height;

    return {
      ...layout,
      verticesCount: graph.vertices.length
    };
  }, [graph]);

  const graphConnections = useMemo(() => graph.connections, [graph]);

  const setAnimatedVertexPosition = useCallback(
    (key: string, position: AnimatedPositionCoordinates) => {
      verticesPositionsRef.current[key] = position;

      if (++renderedVerticesCountRef.current === graphLayout.verticesCount) {
        setAreAllVerticesRendered(true);

        requestAnimationFrame(() => {
          setIsAnimating(true);
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
  const containerWidth = useDerivedValue(
    () => right.value - left.value,
    [right, left]
  );
  const containerHeight = useDerivedValue(
    () => bottom.value - top.value,
    [top, bottom]
  );

  return (
    <Group>
      {/*TODO - remove these rects after testing*/}
      <Rect
        x={left}
        y={top}
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

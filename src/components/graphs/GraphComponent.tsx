import { useAnimationFrame, useGraphObserver } from '@/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { Group, Rect } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedBoundingVertices,
  AnimatedPositionCoordinates,
  Dimensions,
  Position
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
  onRendered: (containerDimensions: Dimensions) => void;
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
  boundingRect,
  onRendered
}: GraphComponentProps<V, E, S, R> & GraphComponentPrivateProps) {
  const [{ vertices, edges }] = useGraphObserver(graph);
  const [isAnimating, setIsAnimating] = useAnimationFrame(
    () =>
      applyDefaultForces(
        graph.connections,
        animatedVerticesPositionsRef.current
      ),
    true
  );
  const [verticesPlacementPositions, setVerticesPlacementPositions] = useState<
    Record<string, Position>
  >({});
  const animatedVerticesPositionsRef = useRef<
    Record<string, AnimatedPositionCoordinates>
  >({});

  const topVertexKey = useSharedValue<string | null>(null);
  const bottomVertexKey = useSharedValue<string | null>(null);
  const leftVertexKey = useSharedValue<string | null>(null);
  const rightVertexKey = useSharedValue<string | null>(null);

  const { top, bottom, right, left } = boundingRect;
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

  useEffect(() => {
    // Place vertices using the selected placement strategy if the whole graph
    // model was changed
    const layout = placeVertices(
      graph,
      memoSettings.components.vertex.radius,
      memoSettings.placement
    );

    top.value = 0;
    left.value = 0;
    right.value = layout.width;
    bottom.value = layout.height;

    onRendered({
      width: layout.width,
      height: layout.height
    });

    setVerticesPlacementPositions(layout.verticesPositions);
  }, [graph]);

  useEffect(() => {
    // Update vertices placement positions if vertices in the current graph model
    // were changed
    animatedVerticesPositionsRef.current = Object.fromEntries(
      vertices
        .map(vertex => [
          vertex.key,
          animatedVerticesPositionsRef.current[vertex.key]
        ])
        .filter(([, position]) => position)
    ) as typeof animatedVerticesPositionsRef.current;

    setVerticesPlacementPositions(
      Object.fromEntries(
        vertices.map(vertex => [
          vertex.key,
          // TODO - calculate the initial vertex position
          verticesPlacementPositions[vertex.key] || {
            x: (Math.random() > 0.5 ? -1 : 1) * 50 + (Math.random() - 0.5) * 25,
            y: (Math.random() > 0.5 ? -1 : 1) * 50 + (Math.random() - 0.5) * 25
          }
        ])
      )
    );
  }, [vertices]);

  const setAnimatedVertexPosition = useCallback(
    (key: string, position: AnimatedPositionCoordinates) => {
      animatedVerticesPositionsRef.current[key] = position;
    },
    []
  );

  const renderEdges = useCallback(() => {
    return edges.map(edge => (
      <EdgeComponent
        key={edge.key}
        {...({
          edge,
          verticesPositions: animatedVerticesPositionsRef.current,
          vertexRadius: memoSettings.components.vertex.radius,
          renderers: memoRenderers.edge,
          settings: memoSettings.components.edge
        } as EdgeComponentProps<E, V>)}
      />
    ));
    // Update edges if edges in the current graph model were changed
    // or vertices were added/removed from the graph model
  }, [edges, verticesPlacementPositions]);

  const renderVertices = useCallback(
    () =>
      Object.entries(verticesPlacementPositions).map(
        ([key, placementPosition]) => {
          const vertex = graph.vertex(key);

          if (!vertex) {
            return null;
          }

          return (
            <VertexComponent<V, E>
              key={key}
              vertex={vertex}
              settings={memoSettings.components.vertex}
              placementPosition={placementPosition}
              containerBoundingRect={boundingRect}
              boundingVertices={boundingVertices}
              renderer={memoRenderers.vertex}
              setAnimatedPosition={setAnimatedVertexPosition}
            />
          );
        }
      ),
    [verticesPlacementPositions]
  );

  // TODO - remove this after testing
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
      {/* TODO - remove this rect after testing */}
      <Rect
        x={left}
        y={top}
        width={containerWidth}
        height={containerHeight}
        color='#444'
      />
      {renderEdges()}
      {renderVertices()}
    </Group>
  );
}

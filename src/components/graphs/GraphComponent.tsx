import { useAnimationFrame, useGraphObserver } from '@/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { Circle, Group, Rect, Vector } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedBoundingVertices,
  AnimatedVectorCoordinates,
  Dimensions
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
  // const [isAnimating, setIsAnimating] = useAnimationFrame(
  //   () =>
  //     applyDefaultForces(
  //       graph.connections,
  //       animatedVerticesPositionsRef.current
  //     ),
  //   true
  // );

  // VERTICES POSITIONS
  // Current positions of vertices in the graph model
  const [animatedVerticesPositions, setAnimatedVerticesPositions] = useState<
    Record<string, AnimatedVectorCoordinates>
  >({});
  // Current positions of placement vertices in the graph model
  // (placement vertices are used to calculate the initial positions of vertices
  // and to ensure that vertices are placed depending on the placement strategy)
  const animatedVerticesPlacementPositionsRef = useRef<
    Record<string, AnimatedVectorCoordinates>
  >({});
  // Target placement positions of vertices in the graph model
  // (This is used to animate placement vertices to their target positions when
  // graph layout changes or placement strategy changes)
  const targetPlacementPositionsRef = useRef<Record<string, Vector>>({});

  const topVertexKey = useSharedValue<string | null>(null);
  const bottomVertexKey = useSharedValue<string | null>(null);
  const leftVertexKey = useSharedValue<string | null>(null);
  const rightVertexKey = useSharedValue<string | null>(null);

  const boundingVertices: AnimatedBoundingVertices = useMemo(
    () => ({
      top: topVertexKey,
      bottom: bottomVertexKey,
      left: leftVertexKey,
      right: rightVertexKey
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
    [graph, renderers]
  );

  useEffect(() => {
    const layout = placeVertices(
      graph,
      memoSettings.components.vertex.radius,
      memoSettings.placement
    );

    targetPlacementPositionsRef.current = layout.verticesPositions;
  }, [vertices, edges]);

  const setAnimatedVertexPosition = useCallback(
    (key: string, position: AnimatedVectorCoordinates | null) => {
      setAnimatedVerticesPositions(prev =>
        updateAnimatedVerticesPositions(key, position, prev)
      );
    },
    []
  );

  const setAnimatedVertexPlacementPosition = useCallback(
    (key: string, position: AnimatedVectorCoordinates | null) => {
      animatedVerticesPlacementPositionsRef.current =
        updateAnimatedVerticesPositions(
          key,
          position,
          animatedVerticesPlacementPositionsRef.current
        );
    },
    []
  );

  const updateAnimatedVerticesPositions = useCallback(
    (
      key: string,
      position: AnimatedVectorCoordinates | null,
      animatedPositions: Record<string, AnimatedVectorCoordinates>
    ): Record<string, AnimatedVectorCoordinates> => {
      // TODO - check if this works
      if (!position) {
        delete animatedPositions[key];
      } else {
        animatedPositions[key] = position;
      }
      return { ...animatedPositions };
    },
    []
  );

  const renderEdges = useCallback(() => {
    return edges.map(edge => (
      <EdgeComponent
        key={edge.key}
        {...({
          edge,
          verticesPositions: animatedVerticesPositions,
          vertexRadius: memoSettings.components.vertex.radius,
          renderers: memoRenderers.edge,
          settings: memoSettings.components.edge
        } as EdgeComponentProps<E, V>)}
      />
    ));
    // Update edges if rendered vertices were changed or if edges in the current
    // graph model were changed
  }, [animatedVerticesPositions, edges]);

  const renderVertices = useCallback(
    () =>
      vertices.map(vertex => (
        <VertexComponent<V, E>
          key={vertex.key}
          vertex={vertex}
          settings={memoSettings.components.vertex}
          containerBoundingRect={boundingRect}
          boundingVertices={boundingVertices}
          renderer={memoRenderers.vertex}
          setAnimatedPosition={setAnimatedVertexPosition}
          setAnimatedPlacementPosition={setAnimatedVertexPlacementPosition}
        />
      )),
    // Update vertices if vertices in the current graph model were changed
    [vertices]
  );

  // TODO - improve this function and add to forces settings
  const renderPlacementVertices = useCallback(
    () =>
      vertices.map(vertex => {
        const position = animatedVerticesPositions[vertex.key];
        if (!position) {
          return null;
        }
        return (
          <Circle
            key={`${vertex.key}-placement`}
            cx={position.x}
            cy={position.y}
            r={memoSettings.components.vertex.radius}
            color='#ff0000'
            opacity={0.25}
          />
        );
      }),
    // Render placement vertices after graph vertices were rendered
    [animatedVerticesPositions]
  );

  // TODO - remove this after testing
  const { top, bottom, right, left } = boundingRect;
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
      {renderPlacementVertices()}
    </Group>
  );
}

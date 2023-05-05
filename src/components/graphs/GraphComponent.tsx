import { useAnimationFrame, useGraphObserver } from '@/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { Circle, Group, Rect, Vector } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedBoundingVertices,
  AnimatedVectorCoordinates
} from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings } from '@/types/settings';
import {
  animateVertexToFinalPosition,
  animateVerticesToFinalPositions
} from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import { placeVertices } from '@/utils/placement';

import DefaultEdgeArrowRenderer from './arrows/renderers/DefaultEdgeArrowRenderer';
import EdgeComponent, { EdgeComponentProps } from './edges/EdgeComponent';
import DefaultEdgeRenderer from './edges/renderers/DefaultEdgeRenderer';
import VertexComponent from './vertices/VertexComponent';
import DefaultVertexRenderer from './vertices/renderers/DefaultVertexRenderer';

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
  forcesApplied?: boolean;
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
  forcesApplied = false
}: GraphComponentProps<V, E, S, R> & GraphComponentPrivateProps) {
  const [{ vertices, edges }] = useGraphObserver(graph);
  const [_, setIsAnimatingForces] = useAnimationFrame(
    () =>
      applyForces(
        graph.connections,
        animatedVerticesPositions,
        animatedVerticesPlacementPositionsRef.current
      ),
    forcesApplied
  );

  // VERTICES POSITIONS
  // Current positions of vertices in the graph model
  const [animatedVerticesPositions, setAnimatedVerticesPositions] = useState<
    Record<string, AnimatedVectorCoordinates>
  >({});
  // This is used as a workaround for the VertexComponent which must have
  // information about current positions of vertices in the graph model
  // but cannot be rerendered on every change of the positions
  const sharedAnimatedVerticesPositions = useMemo<
    Record<string, AnimatedVectorCoordinates>
  >(() => ({}), []);
  // Target placement positions of vertices in the graph model
  // (This is used to animate placement vertices to their target positions when
  // graph layout changes or placement strategy changes)
  const [targetPlacementPositions, setTargetPlacementPositions] = useState<
    Record<string, Vector>
  >({});
  // This is used as a workaround for callback functions which don't see
  // targetPlacementPositions state changes
  const targetPlacementPositionsRef = useRef<Record<string, Vector>>({});
  // Current positions of placement vertices in the graph model
  // (placement vertices are used to calculate the initial positions of vertices
  // and to ensure that vertices are placed depending on the placement strategy)
  const animatedVerticesPlacementPositionsRef = useRef<
    Record<string, AnimatedVectorCoordinates>
  >({});

  // BOUNDING VERTICES
  // Current bounding vertices
  const topVertexKey = useSharedValue<string | null>(null);
  const bottomVertexKey = useSharedValue<string | null>(null);
  const leftVertexKey = useSharedValue<string | null>(null);
  const rightVertexKey = useSharedValue<string | null>(null);
  const boundingVertices = useMemo<AnimatedBoundingVertices>(
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
    setTargetPlacementPositions(layout.verticesPositions);

    // Animate graph vertices to their target positions only if
    // forces are not applied
    if (forcesApplied) {
      // TODO - make this animation optional (enable in forces settings)
      animateVerticesToFinalPositions(
        animatedVerticesPlacementPositionsRef.current,
        layout.verticesPositions
      );
    } else {
      animateVerticesToFinalPositions(
        animatedVerticesPositions,
        layout.verticesPositions
      );
    }
  }, [vertices, edges]);

  useEffect(() => {
    setIsAnimatingForces(forcesApplied);
  }, [forcesApplied]);

  const setAnimatedVertexPosition = useCallback(
    (key: string, position: AnimatedVectorCoordinates | null) => {
      // Update the state to trigger rerendering of the graph
      setAnimatedVerticesPositions(prev =>
        updateAnimatedVerticesPositions(key, position, prev)
      );
      // Update the shared memoized animated positions object
      // (this is used as a workaround for the VertexComponent which must have
      // information about current positions of vertices in the graph model
      // but cannot be rerendered on every change of the positions)
      if (position) {
        sharedAnimatedVerticesPositions[key] = position;
      } else {
        delete sharedAnimatedVerticesPositions[key];
      }
    },
    []
  );

  const setAnimatedVertexPlacementPosition = useCallback(
    (key: string, position: AnimatedVectorCoordinates | null) => {
      // Update the placement positions ref
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
        const finalPosition = targetPlacementPositionsRef.current[key];
        if (finalPosition) {
          animateVertexToFinalPosition(position, finalPosition);
        }
      }
      return { ...animatedPositions };
    },
    []
  );

  const renderEdges = useCallback(() => {
    return edges.map(edge => {
      const [v1, v2] = edge.vertices;
      const v1Position = animatedVerticesPositions[v1.key];
      const v2Position = animatedVerticesPositions[v2.key];

      if (!v1Position || !v2Position) {
        return null;
      }

      return (
        <EdgeComponent
          key={edge.key}
          {...({
            edge,
            v1Position,
            v2Position,
            vertexRadius: memoSettings.components.vertex.radius,
            renderers: memoRenderers.edge,
            settings: memoSettings.components.edge
          } as EdgeComponentProps<E, V>)}
        />
      );
    });
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
          boundingVertices={boundingVertices}
          containerBoundingRect={boundingRect}
          verticesPositions={animatedVerticesPositions}
          renderer={memoRenderers.vertex}
          setAnimatedPosition={setAnimatedVertexPosition}
          setAnimatedPlacementPosition={setAnimatedVertexPlacementPosition}
        />
      )),
    // Update vertices after graph layout was recalculated
    [targetPlacementPositions]
  );

  // TODO - improve this function and add to forces settings
  const renderPlacementVertices = useCallback(
    () =>
      vertices.map(vertex => {
        const position =
          animatedVerticesPlacementPositionsRef.current[vertex.key];
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
      {/* TODO = make this render optional (forces settings) */}
      {forcesApplied && renderPlacementVertices()}
      {renderVertices()}
    </Group>
  );
}

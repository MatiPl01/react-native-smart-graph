import { useGraphObserver } from '@/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';

import { Group, Rect, Vector } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Graph } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedVectorCoordinates
} from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings } from '@/types/settings';
import {
  animateVertexToFinalPosition,
  animateVerticesToFinalPositions
} from '@/utils/animations';
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
  boundingRect
}: GraphComponentProps<V, E, S, R> & GraphComponentPrivateProps) {
  const [{ vertices, edges }] = useGraphObserver(graph);

  // VERTICES POSITIONS
  // Current positions of vertices in the graph model
  const [animatedVerticesPositions, setAnimatedVerticesPositions] = useState<
    Record<string, AnimatedVectorCoordinates>
  >({});
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
  const animatedVerticesPlacementPosition = useMemo<
    Record<string, AnimatedVectorCoordinates>
  >(() => ({}), []);

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
  }, [vertices, edges]);

  useAnimatedReaction(
    () => ({ positions: animatedVerticesPositions }),
    ({ positions }) => {
      // Update the bounding rect on every vertex position change
      let top = Infinity;
      let bottom = -Infinity;
      let left = Infinity;
      let right = -Infinity;

      Object.values(positions).forEach(({ x, y }) => {
        if (x.value < left) {
          left = x.value;
        }
        if (x.value > right) {
          right = x.value;
        }
        if (y.value < top) {
          top = y.value;
        }
        if (y.value > bottom) {
          bottom = y.value;
        }
      });

      const vertexRadius = memoSettings.components.vertex.radius;
      boundingRect.top.value = top - vertexRadius;
      boundingRect.bottom.value = bottom + vertexRadius;
      boundingRect.left.value = left - vertexRadius;
      boundingRect.right.value = right + vertexRadius;
    }
  );

  useAnimatedReaction(
    () => ({ positions: targetPlacementPositions }),
    ({ positions }) => {
      // Animate vertices to their final positions
      animateVerticesToFinalPositions(animatedVerticesPositions, positions);
    }
  );

  const setAnimatedVertexPosition = useCallback(
    (key: string, position: AnimatedVectorCoordinates | null) => {
      // Update the state to trigger rerendering of the graph
      setAnimatedVerticesPositions(prev =>
        position
          ? { ...prev, [key]: position }
          : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
      );
      // Animate vertex to its final position
      const finalPosition = targetPlacementPositionsRef.current[key];
      if (position && finalPosition) {
        animateVertexToFinalPosition(position, finalPosition);
      }
    },
    []
  );

  const setAnimatedVertexPlacementPosition = useCallback(
    (key: string, position: AnimatedVectorCoordinates | null) => {
      // Update the placement positions ref
      if (position) {
        animatedVerticesPlacementPosition[key] = position;
      } else {
        delete animatedVerticesPlacementPosition[key];
      }
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
          renderer={memoRenderers.vertex}
          setAnimatedPosition={setAnimatedVertexPosition}
          setAnimatedPlacementPosition={setAnimatedVertexPlacementPosition}
        />
      )),
    // Update vertices after graph layout was recalculated
    [targetPlacementPositions]
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
    </Group>
  );
}

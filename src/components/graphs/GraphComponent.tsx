import { useGraphObserver } from '@/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';

import { Group, Rect, Vector } from '@shopify/react-native-skia';

import { VERTEX_COMPONENT_SETTINGS } from '@/constants/components';
import { Edge, Graph, Vertex } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedVectorCoordinates,
  Dimensions
} from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphLayout, GraphSettings } from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { placeVertices } from '@/utils/placement';

import DefaultEdgeArrowRenderer from './arrows/renderers/DefaultEdgeArrowRenderer';
import EdgeComponent, { EdgeComponentProps } from './edges/EdgeComponent';
import DefaultEdgeRenderer from './edges/renderers/DefaultEdgeRenderer';
import VertexComponent from './vertices/VertexComponent';
import DefaultVertexRenderer from './vertices/renderers/DefaultVertexRenderer';

export type GraphComponentPrivateProps<V, E> = {
  boundingRect: AnimatedBoundingRect;
  onRender: (containerDimensions: Dimensions) => void;
  setAnimatedVerticesPositions?: (
    positions: Record<string, AnimatedVectorCoordinates>
  ) => void;
  setGraphSettings?: (settings: GraphSettings<V, E>) => void;
  setGraphModel?: (graph: Graph<V, E>) => void;
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
  onRender,
  setAnimatedVerticesPositions: setContextAnimatedVerticesPositions,
  setGraphSettings,
  setGraphModel
}: GraphComponentProps<V, E, S, R> & GraphComponentPrivateProps<V, E>) {
  // GRAPH OBSERVER
  const [{ vertices, edges }] = useGraphObserver(graph);

  // HELPER REFS
  const isFirstRenderRef = useRef(true);

  // GRAPH STATE
  // Vertices
  const [verticesData, setVerticesData] = useState<
    Record<
      string,
      {
        vertex: Vertex<V, E>;
        targetPlacementPosition: Vector;
        removed: boolean;
      }
    >
  >({});
  // Edges
  const [edgesData, setEdgesData] = useState<
    Record<
      string,
      {
        edge: Edge<E, V>;
        removed: boolean;
      }
    >
  >({});

  // ANIMATED VALUES
  // Current vertices positions
  const [animatedVerticesPositions, setAnimatedVerticesPositions] = useState<
    Record<string, AnimatedVectorCoordinates>
  >({});

  const memoSettings = useMemo(() => {
    const newSettings = {
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
    };

    setGraphSettings?.(newSettings);

    return newSettings;
  }, [settings]);

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

  const memoGraphLayout = useMemo<GraphLayout>(
    () =>
      placeVertices(
        graph,
        memoSettings.components.vertex.radius,
        memoSettings.placement
      ),
    [vertices, edges]
  );

  useEffect(() => {
    setGraphModel?.(graph);
  }, [graph]);

  useEffect(() => {
    // UPDATE VERTICES DATA
    const newVerticesData = { ...verticesData };
    // Add new vertices to vertex data
    vertices.forEach(vertex => {
      const targetPlacementPosition =
        memoGraphLayout.verticesPositions[vertex.key];
      if (!newVerticesData[vertex.key] && targetPlacementPosition) {
        newVerticesData[vertex.key] = {
          vertex,
          targetPlacementPosition,
          removed: false
        };
      }
    });
    // Mark vertices as removed if there were removed from the graph model
    Object.keys(newVerticesData).forEach(key => {
      if (!graph.hasVertex(key)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newVerticesData[key]!.removed = true;
      }
    });
    // Set new vertices data
    setVerticesData(newVerticesData);

    // Call onRender callback on the first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      onRender({
        width: memoGraphLayout.width,
        height: memoGraphLayout.height
      });
    }
  }, [memoGraphLayout]);

  useEffect(() => {
    // UPDATE EDGES DATA
    // Add new edges to edges data
    const newEdgesData = { ...edgesData };
    edges.forEach(edge => {
      if (!newEdgesData[edge.key]) {
        newEdgesData[edge.key] = {
          edge,
          removed: false
        };
      }
    });
    // Mark edges as removed if there were removed from the graph model
    Object.keys(newEdgesData).forEach(key => {
      if (!graph.hasEdge(key)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newEdgesData[key]!.removed = true;
      }
    });
    // Set the new edges data
    setEdgesData(newEdgesData);
  }, [edges]);

  useEffect(() => {
    setContextAnimatedVerticesPositions?.(animatedVerticesPositions);
  }, [animatedVerticesPositions]);

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
    () => ({}),
    () => {
      animateVerticesToFinalPositions(
        animatedVerticesPositions,
        memoGraphLayout.verticesPositions
      );
    },
    [animatedVerticesPositions]
  );

  const handleVertexRender = useCallback(
    (key: string, position: AnimatedVectorCoordinates) => {
      // This setTimeout is a tricky workaround to prevent setAnimatedVerticesPositions being called
      // at the same time as the useAnimatedReaction callback
      setTimeout(() => {
        // Update animated vertices positions
        setAnimatedVerticesPositions(prev => ({ ...prev, [key]: position }));
      }, 0);
    },
    []
  );

  const handleVertexRemove = useCallback((key: string) => {
    // Remove vertex from the vertices data
    setVerticesData(prev =>
      Object.fromEntries(
        Object.entries(prev).filter(([vertexKey]) => vertexKey !== key)
      )
    );
    // Remove vertex animated position
    setAnimatedVerticesPositions(prev =>
      Object.fromEntries(
        Object.entries(prev).filter(([vertexKey]) => vertexKey !== key)
      )
    );
  }, []);

  const handleEdgeRemove = useCallback((key: string) => {
    // Remove edge from the edges data
    setEdgesData(prev =>
      Object.fromEntries(
        Object.entries(prev).filter(([edgeKey]) => edgeKey !== key)
      )
    );
  }, []);

  const renderEdges = useCallback(() => {
    return Object.values(edgesData).map(({ edge, removed }) => {
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
            settings: memoSettings.components.edge,
            onRemove: handleEdgeRemove,
            removed
          } as EdgeComponentProps<E, V>)}
        />
      );
    });
    // Update edges if rendered vertices were changed or if edges in the current
    // graph model were changed
  }, [animatedVerticesPositions, edgesData]);

  const renderVertices = useCallback(
    () =>
      Object.values(verticesData).map(({ vertex, removed }) => (
        <VertexComponent<V, E>
          key={vertex.key}
          vertex={vertex}
          settings={memoSettings.components.vertex}
          renderer={memoRenderers.vertex}
          onRender={handleVertexRender}
          onRemove={handleVertexRemove}
          removed={removed}
        />
      )),
    // Update vertices after graph layout was recalculated
    [verticesData]
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

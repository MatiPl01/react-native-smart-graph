import { useAnimationFrame, useGraphObserver } from '@/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withDelay,
  withTiming
} from 'react-native-reanimated';

import { Circle, Group, Rect, Vector } from '@shopify/react-native-skia';

import {
  ARROW_COMPONENT_SETTINGS,
  CURVED_EDGE_COMPONENT_SETTINGS,
  LABEL_COMPONENT_SETTINGS,
  STRAIGHT_EDGE_COMPONENT_SETTINGS,
  VERTEX_COMPONENT_SETTINGS
} from '@/constants/components';
import { GraphEventsContextType } from '@/context/graphEvents';
import { EdgeComponentProps } from '@/types/components';
import { Edge, Graph, Vertex } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedVector,
  AnimatedVectorCoordinates,
  Dimensions,
  VerticesPositions
} from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import {
  DirectedEdgeSettings,
  GraphLayout,
  GraphSettings,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { animateToFinalPositions } from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import { placeVertices } from '@/utils/placement';

import DefaultEdgeArrowRenderer from './arrows/renderers/DefaultEdgeArrowRenderer';
import EdgeComponent from './edges/EdgeComponent';
import DefaultCurvedEdgeRenderer from './edges/curved/renderers/DefaultCurvedEdgeRenderer';
import DefaultStraightEdgeRenderer from './edges/straight/renderers/DefaultStraightEdgeRenderer';
import VertexComponent from './vertices/VertexComponent';
import DefaultVertexRenderer from './vertices/renderers/DefaultVertexRenderer';

export type GraphComponentPrivateProps<V, E> = {
  boundingRect: AnimatedBoundingRect;
  onRender: (containerDimensions: Dimensions) => void;
  graphEventsContext: GraphEventsContextType<V, E>;
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
  graphEventsContext
}: GraphComponentProps<V, E, S, R> & GraphComponentPrivateProps<V, E>) {
  // GRAPH OBSERVER
  const [{ vertices, orderedEdges }] = useGraphObserver(graph);
  // GRAPH FORCES ANIMATION
  const [_, setForcesApplied] = useAnimationFrame(() => {
    // TODO - run animations on the UI thread instead of JS thread (don't use custom useAnimationFrame hook)
    applyForces(
      graph.connections,
      animatedVerticesPositions,
      {
        graph: graphForcesScale,
        target: targetForcesScale
      },
      {
        strategy: 'default'
      } // TODO: replace this by actual forces settings
    );
  });

  // HELPER REFS
  // Render
  const isFirstRenderRef = useRef(true);
  // Forces
  const graphForcesScale = useSharedValue(0);
  const targetForcesScale = useSharedValue(1);

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
        order: number;
        edgesCount: number;
        removed: boolean;
      }
    >
  >({});

  // ANIMATED VALUES
  // Current vertices positions
  const [animatedVerticesPositions, setAnimatedVerticesPositions] =
    useState<VerticesPositions>({});
  // Current edge labels positions
  const animatedEdgeLabelsPositions = useRef<Record<string, AnimatedVector>>(
    {} as Record<string, AnimatedVector>
  );

  const memoSettings = useMemo(() => {
    const newSettings: GraphSettingsWithDefaults<V, E> = {
      ...settings,
      components: {
        ...settings?.components,
        vertex: {
          ...VERTEX_COMPONENT_SETTINGS,
          ...settings?.components?.vertex
        },
        edge: {
          ...(settings?.components?.edge?.type === 'curved'
            ? CURVED_EDGE_COMPONENT_SETTINGS
            : STRAIGHT_EDGE_COMPONENT_SETTINGS),
          ...settings?.components?.edge,
          ...(graph.isDirected()
            ? {
                arrow: {
                  ...ARROW_COMPONENT_SETTINGS,
                  ...(settings?.components?.edge as DirectedEdgeSettings)?.arrow
                }
              }
            : {}),

          label: {
            ...LABEL_COMPONENT_SETTINGS,
            ...settings?.components?.edge?.label
          }
        }
      }
    };

    graphEventsContext.setGraphSettings(newSettings);

    return newSettings;
  }, [settings]);

  const memoRenderers = useMemo(
    () => ({
      vertex: DefaultVertexRenderer,
      edge: {
        arrow: graph.isDirected() ? DefaultEdgeArrowRenderer : undefined,
        edge:
          renderers?.edge || settings?.components?.edge?.type === 'curved'
            ? DefaultCurvedEdgeRenderer
            : DefaultStraightEdgeRenderer,
        label: renderers?.label
      }
    }),
    [graph, settings, renderers]
  );

  const memoGraphLayout = useMemo<GraphLayout>(
    () =>
      placeVertices(
        graph,
        memoSettings.components.vertex.radius,
        memoSettings.placement
      ),
    [vertices, orderedEdges]
  );

  useEffect(() => {
    graphEventsContext.setGraphModel(graph);
  }, [graph]);

  useEffect(() => {
    // UPDATE VERTICES DATA
    const newVerticesData = { ...verticesData };
    // Add new vertices to vertex data
    vertices.forEach(vertex => {
      const targetPlacementPosition =
        memoGraphLayout.verticesPositions[vertex.key];
      if (
        targetPlacementPosition &&
        (!newVerticesData[vertex.key] || newVerticesData[vertex.key]?.removed)
      ) {
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
    orderedEdges.forEach(({ edge, order, edgesCount }) => {
      if (
        !newEdgesData[edge.key] ||
        newEdgesData[edge.key]?.removed ||
        newEdgesData[edge.key]?.edgesCount !== edgesCount
      ) {
        newEdgesData[edge.key] = {
          edge,
          order,
          edgesCount,
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
  }, [orderedEdges]);

  useEffect(() => {
    graphEventsContext.setAnimatedVerticesPositions(
      Object.fromEntries(
        Object.entries(animatedVerticesPositions).map(
          ([key, { displayed }]) => [key, displayed]
        )
      )
    );
  }, [animatedVerticesPositions]);

  useEffect(() => {
    setTimeout(() => {
      setForcesApplied(true); // TODO - remove this timeout
    }, 100);
  }, []);

  useEffect(() => {
    graphEventsContext.setAnimatedEdgeLabelsPositions(
      animatedEdgeLabelsPositions.current
    );
  }, [animatedEdgeLabelsPositions]);

  useAnimatedReaction(
    () => ({ positions: animatedVerticesPositions }),
    ({ positions }) => {
      // Update the bounding rect on every vertex position change
      let top = Infinity;
      let bottom = -Infinity;
      let left = Infinity;
      let right = -Infinity;

      Object.values(positions).forEach(({ displayed: { x, y } }) => {
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
      // TODO cleanup this function, find better timing values
      targetForcesScale.value = withTiming(10, {
        duration: 250
      });
      graphForcesScale.value = withTiming(0.1, {
        duration: 250
      });

      animateToFinalPositions(
        Object.fromEntries(
          Object.entries(animatedVerticesPositions).map(([key, { target }]) => [
            key,
            target
          ])
        ),
        memoGraphLayout.verticesPositions
      );

      targetForcesScale.value = withDelay(
        500,
        withTiming(1, {
          duration: 250
        })
      );
      graphForcesScale.value = withDelay(
        500,
        withTiming(1, {
          duration: 250
        })
      );
    },
    [animatedVerticesPositions, memoGraphLayout.verticesPositions]
  );

  const handleVertexRender = useCallback(
    (
      key: string,
      positions: {
        displayed: AnimatedVectorCoordinates;
        target: AnimatedVectorCoordinates;
      }
    ) => {
      // This setTimeout is a tricky workaround to prevent setAnimatedVerticesPositions being called
      // at the same time as the useAnimatedReaction callback
      setTimeout(() => {
        // Update animated vertices positions
        setAnimatedVerticesPositions(prev => ({
          ...prev,
          [key]: positions
        }));
      }, 0);
    },
    []
  );

  const handleEdgeLabelRender = useCallback(
    (key: string, position: AnimatedVector) => {
      animatedEdgeLabelsPositions.current[key] = position;
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
    return Object.values(edgesData).map(
      ({ edge, order, edgesCount, removed }) => {
        const [v1, v2] = edge.vertices;
        const v1Position = animatedVerticesPositions[v1.key]?.displayed;
        const v2Position = animatedVerticesPositions[v2.key]?.displayed;

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
              order,
              edgesCount,
              vertexRadius: memoSettings.components.vertex.radius,
              renderers: memoRenderers.edge,
              settings: memoSettings.components.edge,
              onRemove: handleEdgeRemove,
              onLabelRender: handleEdgeLabelRender,
              removed
            } as EdgeComponentProps<E, V>)}
          />
        );
      }
    );
    // Update edges if rendered vertices were changed or if edges in the current
    // graph model were changed
  }, [animatedVerticesPositions, edgesData]);

  const renderVertices = useCallback(
    () =>
      Object.values(verticesData).map(({ vertex, removed }) => (
        <VertexComponent
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

  const containerWidth = useDerivedValue(
    () => boundingRect.right.value - boundingRect.left.value
  );
  const containerHeight = useDerivedValue(
    () => boundingRect.bottom.value - boundingRect.top.value
  );

  return (
    <Group>
      <Rect
        x={boundingRect.left}
        y={boundingRect.top}
        width={containerWidth}
        height={containerHeight}
        color='#222'
      />
      {Object.entries(animatedVerticesPositions).map(
        ([
          key,
          {
            target: { x: cx, y: cy }
          }
        ]) => (
          <Circle key={key} cx={cx} cy={cy} r={10} color='white' />
        )
      )}
      {renderEdges()}
      {renderVertices()}
    </Group>
  );
}

import { Circle, Group, Rect } from '@shopify/react-native-skia';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';

import { GraphEventsContextType } from '@/context/graphEvents';
import { useGraphObserver } from '@/hooks';
import {
  EdgeComponentProps,
  GraphData,
  GraphEdgeData,
  GraphVertexData
} from '@/types/components';
import { Graph } from '@/types/graphs';
import {
  AnimatedBoundingRect,
  AnimatedVector,
  AnimatedVectorCoordinates,
  BoundingRect,
  VerticesPositions
} from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import { GraphSettings, GraphSettingsWithDefaults } from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import {
  updateGraphEdgesData,
  updateGraphRenderersWithDefaults,
  updateGraphSettingsWithDefaults,
  updateGraphVerticesData
} from '@/utils/components';
import { applyForces } from '@/utils/forces';
import { calcContainerBoundingRect, placeVertices } from '@/utils/placement';

import EdgeComponent from './edges/EdgeComponent';
import VertexComponent from './vertices/VertexComponent';

export type GraphComponentPrivateProps<V, E> = {
  boundingRect: AnimatedBoundingRect;
  onRender: (containerBounds: BoundingRect) => void;
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
  const [graphData] = useGraphObserver(graph);

  // HELPER REFS
  const isFirstRenderRef = useRef(true);
  // Forces
  const graphForcesScale = useSharedValue(0);
  const targetForcesScale = useSharedValue(1);
  const lastForcesUpdateTime = useSharedValue(0);

  // GRAPH STATE
  // Vertices
  const [verticesData, setVerticesData] = useState<
    Record<string, GraphVertexData<V, E>>
  >({});
  // Edges
  const [edgesData, setEdgesData] = useState<
    Record<string, GraphEdgeData<E, V>>
  >({});

  // ANIMATED VALUES
  // Vertices positions
  const [animatedVerticesPositions, setAnimatedVerticesPositions] =
    useState<VerticesPositions>({});
  // Edge labels positions
  const animatedEdgeLabelsPositions = useRef<Record<string, AnimatedVector>>(
    {} as Record<string, AnimatedVector>
  );

  const memoSettings = useMemo(() => {
    const newSettings: GraphSettingsWithDefaults<V, E> =
      updateGraphSettingsWithDefaults(graph.isDirected(), settings);

    graphEventsContext.setGraphSettings(newSettings);

    return newSettings;
  }, [settings]);

  const memoRenderers = useMemo(
    () =>
      updateGraphRenderersWithDefaults(
        graph.isDirected(),
        memoSettings.components.edge.type,
        renderers
      ),
    [graph, memoSettings, renderers]
  );

  const memoGraphData = useMemo<GraphData<V, E>>(
    () => ({
      ...graphData,
      connections: graph.connections,
      layout: placeVertices(
        graph,
        memoSettings.components.vertex.radius,
        memoSettings.placement
      ),
      animations: graphData.animationsSettings,
      defaultAnimations: memoSettings.animations
    }),
    [graphData, memoSettings]
  );

  useEffect(() => {
    graphEventsContext.setGraphModel(graph);
  }, [graph]);

  useEffect(() => {
    // UPDATE VERTICES DATA
    const updatedVerticesData = updateGraphVerticesData(
      verticesData,
      memoGraphData
    );
    // Set new vertices graphData
    setVerticesData(updatedVerticesData);

    // Call onRender callback on the first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      onRender(memoGraphData.layout.boundingRect);
    }
  }, [memoGraphData]);

  useEffect(() => {
    // UPDATE EDGES DATA
    const updatedEdgesData = updateGraphEdgesData(edgesData, memoGraphData);
    // Set the new edges graphData
    setEdgesData(updatedEdgesData);
  }, [memoGraphData]);

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
    graphEventsContext.setAnimatedEdgeLabelsPositions(
      animatedEdgeLabelsPositions.current
    );
  }, [animatedEdgeLabelsPositions]);

  useAnimatedReaction(
    () => ({
      positions: Object.fromEntries(
        Object.entries(animatedVerticesPositions).map(
          ([key, { displayed }]) => [
            key,
            {
              x: displayed.x.value,
              y: displayed.y.value
            }
          ]
        )
      )
    }),
    ({ positions }) => {
      Object.entries(
        calcContainerBoundingRect(
          positions,
          // Padding near the edges of the container
          memoSettings.components.vertex.radius,
          memoSettings.components.vertex.radius
        )
      ).forEach(
        ([key, value]) =>
          (boundingRect[key as keyof AnimatedBoundingRect].value = value)
      );
    }
  );

  useAnimatedReaction(
    () => ({}),
    () => {
      // TODO cleanup this function, find better timing values
      targetForcesScale.value = withTiming(10, {
        duration: 250
      });
      graphForcesScale.value = withTiming(0.01, {
        duration: 250
      });

      animateVerticesToFinalPositions(
        Object.fromEntries(
          Object.entries(animatedVerticesPositions).map(([key, position]) => [
            key,
            position.target
          ])
        ),
        memoGraphData.layout.verticesPositions,
        {
          ...memoGraphData.defaultAnimations.layout,
          ...memoGraphData.animations.layout
        }
      );

      targetForcesScale.value = withDelay(
        500,
        withTiming(1, {
          duration: 250
        })
      );
      graphForcesScale.value = withDelay(
        400,
        withTiming(1, {
          duration: 250
        })
      );
    },
    [animatedVerticesPositions, memoGraphData]
  );

  useFrameCallback(({ timeSinceFirstFrame }) => {
    // Update forces every 10ms
    if (Math.abs(timeSinceFirstFrame - lastForcesUpdateTime.value) > 10) {
      lastForcesUpdateTime.value = timeSinceFirstFrame;
      applyForces(
        memoGraphData.connections,
        animatedVerticesPositions,
        memoSettings.components.vertex.radius,
        {
          graph: graphForcesScale,
          target: targetForcesScale
        },
        memoSettings.forces
      );
    }
  });

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
        setAnimatedVerticesPositions(prev => ({ ...prev, [key]: positions }));
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
    // Remove vertex from the vertices graphData
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
    // Remove edge from the edges graphData
    setEdgesData(prev =>
      Object.fromEntries(
        Object.entries(prev).filter(([edgeKey]) => edgeKey !== key)
      )
    );
  }, []);

  const renderEdges = useCallback(() => {
    return Object.values(edgesData).map(
      ({ edge, order, edgesCount, animationSettings, removed }) => {
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
              edgeRenderer: memoRenderers.edge,
              arrowRenderer: memoRenderers.arrow,
              labelRenderer: memoRenderers.label,
              settings: memoSettings.components.edge,
              onRemove: handleEdgeRemove,
              onLabelRender: handleEdgeLabelRender,
              animationSettings,
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
      Object.values(verticesData).map(
        ({ vertex, animationSettings, removed }) => (
          <VertexComponent
            key={vertex.key}
            vertex={vertex}
            settings={memoSettings.components.vertex}
            renderer={memoRenderers.vertex}
            onRender={handleVertexRender}
            onRemove={handleVertexRemove}
            animationSettings={animationSettings}
            removed={removed}
          />
        )
      ),
    // Update vertices after graph layout was recalculated
    [verticesData]
  );

  const containerWidth = useDerivedValue(() => {
    return boundingRect.right.value - boundingRect.left.value;
  });
  const containerHeight = useDerivedValue(() => {
    return boundingRect.bottom.value - boundingRect.top.value;
  });

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

import { Group, Rect } from '@shopify/react-native-skia';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';

import { useGraphContext } from '@/contexts/GraphContext';
import { AnimatedBoundingRect, BoundingRect } from '@/types/layout';
import { calcContainerBoundingRect } from '@/utils/placement';

import EdgeComponent from './edges/EdgeComponent';
import VertexComponent from './vertices/VertexComponent';

export type GraphComponentProps = {
  boundingRect: AnimatedBoundingRect;
  onRender: (containerBounds: BoundingRect) => void;
};

function GraphComponent<V, E>({ boundingRect, onRender }: GraphComponentProps) {
  // GRAPH CONTEXT
  const {
    vertices,
    edges,
    handleVertexRender,
    handleEdgeRender,
    handleVertexRemove,
    handleEdgeRemove
  } = useGraphContext<V, E>();

  // GRAPH LAYOUT
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      // TODO - fix this call to onRender
      onRender({
        top: -100,
        left: -100,
        right: 100,
        bottom: 100
      });
    }
  }, [boundingRect, onRender]);

  useAnimatedReaction(
    () => ({
      positions: Object.fromEntries(
        Object.entries(vertices).map(([key, { animatedPosition }]) => [
          key,
          {
            x: animatedPosition.x.value,
            y: animatedPosition.y.value
          }
        ])
      )
    }),
    ({ positions }) => {
      Object.entries(
        calcContainerBoundingRect(
          positions,
          // Padding near the edges of the container
          // TODO - make this padding configurable
          20,
          20
        )
      ).forEach(
        ([key, value]) =>
          (boundingRect[key as keyof AnimatedBoundingRect].value = value)
      );
    }
  );

  const renderEdges = useCallback(() => {
    return Object.values(edges).map(data => {
      const [v1, v2] = data.edge.vertices;
      const v1Data = vertices[v1.key];
      const v2Data = vertices[v2.key];

      if (!v1Data || !v2Data) {
        return null;
      }

      return (
        <EdgeComponent
          {...data}
          key={data.edge.key}
          v1Position={v1Data.animatedPosition}
          v2Position={v2Data.animatedPosition}
          v1Radius={v1Data.currentRadius}
          v2Radius={v2Data.currentRadius}
          onRender={handleEdgeRender}
          onRemove={handleEdgeRemove}
        />
      );
    });
  }, [edges]);

  const renderVertices = useCallback(
    () =>
      Object.values(vertices).map(data => (
        <VertexComponent
          {...data}
          key={data.vertex.key}
          onRender={handleVertexRender}
          onRemove={handleVertexRemove}
        />
      )),
    [vertices]
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
      {renderEdges()}
      {renderVertices()}
    </Group>
  );
}

export default memo(GraphComponent) as (
  props: GraphComponentProps
) => JSX.Element;

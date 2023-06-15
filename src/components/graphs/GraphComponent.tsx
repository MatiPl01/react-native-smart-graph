/* eslint-disable import/no-unused-modules */
import { Group, Rect } from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef } from 'react';
import { useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';

import { useComponentsDataContext } from '@/contexts/ComponentsDataContext';
import { EdgeComponentProps } from '@/types/components';
import { AnimatedBoundingRect, BoundingRect } from '@/types/layout';
import { calcContainerBoundingRect } from '@/utils/placement';

import EdgeComponent from './edges/EdgeComponent';
import VertexComponent from './vertices/VertexComponent';

export type GraphComponentProps = {
  boundingRect: AnimatedBoundingRect;
  onRender: (containerBounds: BoundingRect) => void;
};

export default function GraphComponent<E, V>({
  boundingRect,
  onRender
}: GraphComponentProps) {
  // GRAPH CONTEXT
  const {
    verticesData,
    edgesData,
    verticesRenderData,
    handleVertexRender,
    handleVertexRemove,
    handleEdgeRender,
    handleEdgeRemove
  } = useComponentsDataContext();

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
        Object.entries(verticesRenderData).map(([key, { position }]) => [
          key,
          {
            x: position.x.value,
            y: position.y.value
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
    return Object.values(edgesData).map(data => {
      const [v1, v2] = data.edge.vertices;
      const v1Data = verticesRenderData[v1.key];
      const v2Data = verticesRenderData[v2.key];

      if (!v1Data || !v2Data) {
        return null;
      }

      return (
        <EdgeComponent
          {...({
            ...data,
            key: data.edge.key,
            v1Position: v1Data.position,
            v2Position: v2Data.position,
            v1Radius: v1Data.currentRadius,
            v2Radius: v2Data.currentRadius,
            onRender: handleEdgeRender,
            onRemove: handleEdgeRemove
          } as unknown as EdgeComponentProps<E, V>)}
        />
      );
    });
  }, [edgesData]);

  const renderVertices = useCallback(
    () =>
      Object.values(verticesData).map(data => (
        <VertexComponent
          {...data}
          key={data.vertex.key}
          onRender={handleVertexRender}
          onRemove={handleVertexRemove}
        />
      )),
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
      {renderEdges()}
      {renderVertices()}
    </Group>
  );
}

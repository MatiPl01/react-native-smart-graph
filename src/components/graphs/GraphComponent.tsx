/* eslint-disable import/no-unused-modules */
import { Group, Rect } from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef } from 'react';
import { useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';

import { withGraphData } from '@/providers';
import {
  EdgeComponentData,
  EdgeComponentProps,
  EdgeRemoveHandler,
  EdgeRenderHandler,
  VertexComponentData,
  VertexComponentRenderData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';
import { AnimatedBoundingRect, BoundingRect } from '@/types/layout';
import { calcContainerBoundingRect } from '@/utils/placement';

import EdgeComponent from './edges/EdgeComponent';
import VertexComponent from './vertices/VertexComponent';

export type GraphComponentProps = {
  boundingRect: AnimatedBoundingRect;
  onRender: (containerBounds: BoundingRect) => void;
};

type GraphComponentPropsWithGraphData<V, E> = GraphComponentProps & {
  verticesData: Record<string, VertexComponentData<V, E>>;
  edgesData: Record<string, EdgeComponentData<E, V>>;
  verticesRenderData: Record<string, VertexComponentRenderData>;
  handleVertexRender: VertexRenderHandler;
  handleVertexRemove: VertexRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
  handleEdgeRemove: EdgeRemoveHandler;
};

function GraphComponent<V, E>({
  // Graph component props
  boundingRect,
  onRender,
  // Injected graph data
  verticesData,
  edgesData,
  verticesRenderData,
  handleVertexRender,
  handleVertexRemove,
  handleEdgeRender,
  handleEdgeRemove
}: GraphComponentPropsWithGraphData<V, E>) {
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
    return Object.values(edgesData).map(data => (
      <EdgeComponent
        {...({
          ...data,
          key: data.edge.key,
          onRender: handleEdgeRender,
          onRemove: handleEdgeRemove
        } as unknown as EdgeComponentProps<E, V>)}
      />
    ));
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

export default withGraphData(
  GraphComponent,
  ({
    verticesData,
    edgesData,
    verticesRenderData,
    handleVertexRender,
    handleVertexRemove,
    handleEdgeRender,
    handleEdgeRemove
  }) => ({
    verticesData,
    edgesData,
    verticesRenderData,
    handleVertexRender,
    handleVertexRemove,
    handleEdgeRender,
    handleEdgeRemove
  })
);

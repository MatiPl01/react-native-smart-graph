/* eslint-disable import/no-unused-modules */
import { Group } from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef } from 'react';

import { withGraphData } from '@/providers';
import {
  EdgeComponentData,
  EdgeComponentProps,
  EdgeRemoveHandler,
  EdgeRenderHandler,
  VertexComponentData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { BoundingRect } from '@/types/layout';

import EdgeComponent from './edges/EdgeComponent';
import VertexComponent from './vertices/VertexComponent';

export type GraphComponentProps = {
  onRender: (containerBounds: BoundingRect) => void;
};

type GraphComponentPropsWithGraphData<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = GraphComponentProps & {
  edgesData: Record<string, EdgeComponentData<E, V, ED>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
  handleVertexRemove: VertexRemoveHandler;
  handleVertexRender: VertexRenderHandler;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

function GraphComponent<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  edgesData,
  handleEdgeRemove,
  handleEdgeRender,
  handleVertexRemove,
  handleVertexRender,
  onRender,
  verticesData
}: GraphComponentPropsWithGraphData<V, E, ED>) {
  // GRAPH LAYOUT
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      // TODO - fix this call to onRender
      onRender({
        bottom: 100,
        left: -100,
        right: 100,
        top: -100
      });
    }
  }, [onRender]);

  const renderEdges = useCallback(() => {
    return Object.values(edgesData).map(data => (
      <EdgeComponent
        {...({
          ...data,
          key: data.edge.key,
          onRemove: handleEdgeRemove,
          onRender: handleEdgeRender
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
          onRemove={handleVertexRemove}
          onRender={handleVertexRender}
        />
      )),
    [verticesData]
  );

  return (
    <Group>
      {renderEdges()}
      {renderVertices()}
    </Group>
  );
}

export default withGraphData(
  GraphComponent,
  ({
    edgesData,
    handleEdgeRemove,
    handleEdgeRender,
    handleVertexRemove,
    handleVertexRender,
    verticesData
  }) => ({
    edgesData,
    handleEdgeRemove,
    handleEdgeRender,
    handleVertexRemove,
    handleVertexRender,
    verticesData
  })
);

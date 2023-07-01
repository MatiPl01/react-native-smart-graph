/* eslint-disable import/no-unused-modules */
import { Group } from '@shopify/react-native-skia';
import { useCallback } from 'react';

import { useVertexFocusContext, withGraphData } from '@/providers/graph';
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

import EdgeComponent from './edges/EdgeComponent';
import VertexComponent from './vertices/VertexComponent';

type GraphComponentPropsWithGraphData<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
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
  verticesData
}: GraphComponentPropsWithGraphData<V, E, ED>) {
  const focusContextValue = useVertexFocusContext();

  const renderEdges = useCallback(() => {
    return Object.values(edgesData).map(data => (
      <EdgeComponent
        {...({
          ...data,
          ...focusContextValue,
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
          {...focusContextValue}
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

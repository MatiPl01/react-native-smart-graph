import VertexComponent from '@/components/graphs/vertices/VertexComponent';
import { useVertexFocusContext, withGraphData } from '@/providers/graph';
import {
  VertexComponentData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';

type GraphVerticesProps<V, E> = {
  handleVertexRemove: VertexRemoveHandler;
  handleVertexRender: VertexRenderHandler;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

function GraphVertices<V, E>({
  handleVertexRemove,
  handleVertexRender,
  verticesData
}: GraphVerticesProps<V, E>) {
  const focusContextValue = useVertexFocusContext();

  console.log('GraphVertices');

  return Object.values(verticesData).map(data => (
    <VertexComponent
      {...data}
      {...focusContextValue}
      key={data.vertex.key}
      onRemove={handleVertexRemove}
      onRender={handleVertexRender}
    />
  ));
}

export default withGraphData(
  GraphVertices,
  ({ handleVertexRemove, handleVertexRender, verticesData }) => ({
    handleVertexRemove,
    handleVertexRender,
    verticesData
  })
);

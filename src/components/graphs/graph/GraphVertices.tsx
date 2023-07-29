import VertexComponent from '@/components/graphs/vertices/VertexComponent';
import { FocusContextType } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph';
import {
  VertexComponentData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';

type GraphVerticesProps<V, E> = {
  focusContext: FocusContextType;
  handleVertexRemove: VertexRemoveHandler;
  handleVertexRender: VertexRenderHandler;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

function GraphVertices<V, E>({
  focusContext,
  handleVertexRemove,
  handleVertexRender,
  verticesData
}: GraphVerticesProps<V, E>) {
  return Object.values(verticesData).map(data => (
    <VertexComponent
      {...data}
      focusContext={focusContext}
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

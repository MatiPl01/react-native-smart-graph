import { SharedValue } from 'react-native-reanimated';

import VertexComponent from '@/components/graphs/vertices/VertexComponent';
import { withGraphData } from '@/providers/graph';
import {
  VertexComponentData,
  VertexRemoveHandler,
  VertexRenderHandler
} from '@/types/components';

type GraphVerticesProps<V, E> = {
  focusKey: SharedValue<null | string>;
  focusTransitionProgress: SharedValue<number>;
  handleVertexRemove: VertexRemoveHandler;
  handleVertexRender: VertexRenderHandler;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

function GraphVertices<V, E>({
  focusKey,
  focusTransitionProgress,
  handleVertexRemove,
  handleVertexRender,
  verticesData
}: GraphVerticesProps<V, E>) {
  return Object.values(verticesData).map(data => (
    <VertexComponent
      {...data}
      focusKey={focusKey}
      focusTransitionProgress={focusTransitionProgress}
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

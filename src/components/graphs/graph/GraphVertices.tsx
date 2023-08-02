import VertexComponent from '@/components/graphs/vertices/VertexComponent';
import { FocusContextType } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph';
import { VertexComponentData, VertexRemoveHandler } from '@/types/components';
import { VertexRenderFunction } from '@/types/renderer';
import { VertexSettingsWithDefaults } from '@/types/settings';

type GraphVerticesProps<V, E> = {
  componentSettings: VertexSettingsWithDefaults;
  focusContext: FocusContextType;
  onRemove: VertexRemoveHandler;
  renderer: VertexRenderFunction<V>;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

function GraphVertices<V, E>({
  verticesData,
  ...restProps
}: GraphVerticesProps<V, E>) {
  return Object.values(verticesData).map(data => (
    <VertexComponent {...restProps} {...data} key={data.vertex.key} />
  ));
}

export default withGraphData(
  GraphVertices,
  ({ handleVertexRemove, renderers, settings, verticesData }) => ({
    componentSettings: settings.components.vertex,
    onRemove: handleVertexRemove,
    renderer: renderers.vertex,
    verticesData
  })
);

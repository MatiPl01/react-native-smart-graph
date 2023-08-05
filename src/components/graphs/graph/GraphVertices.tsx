import VertexComponent from '@/components/graphs/vertices/VertexComponent';
import { FocusContextType } from '@/providers/canvas';
import { withComponentsData } from '@/providers/graph/data/components/context';
import {
  GraphSettingsContextType,
  withGraphSettings
} from '@/providers/graph/data/settings/context';
import { VertexComponentData, VertexRemoveHandler } from '@/types/components';
import { VertexRenderFunction } from '@/types/renderers';

type GraphVerticesProps<V, E> = {
  componentSettings: GraphSettingsContextType<
    V,
    E
  >['settings']['components']['vertex'];
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

export default withGraphSettings(
  withComponentsData(GraphVertices, ({ handleVertexRemove, verticesData }) => ({
    onRemove: handleVertexRemove,
    verticesData
  })),
  ({ settings, renderers }) => ({
    componentSettings: settings.components.vertex,
    renderer: renderers.vertex
  })
);

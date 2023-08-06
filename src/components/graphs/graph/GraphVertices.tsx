import { VertexComponent } from '@/components/graphs/vertices';
import { withComponentsData } from '@/providers/graph';
import { withGraphSettings } from '@/providers/graph/data/settings/context';
import { GraphVerticesProps } from '@/types/components';

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
  ({ renderers, settings }) => ({
    componentSettings: settings.components.vertex,
    renderer: renderers.vertex
  })
);

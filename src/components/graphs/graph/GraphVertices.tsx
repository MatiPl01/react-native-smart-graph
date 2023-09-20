import { VertexComponent } from '@/components/graphs';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { GraphVerticesProps } from '@/types/components';

function GraphVertices<V>({
  renderer,
  verticesData,
  ...restProps
}: GraphVerticesProps<V>) {
  return (
    renderer &&
    Object.values(verticesData).map(data => (
      <VertexComponent
        {...restProps}
        data={data}
        key={data.key}
        renderer={renderer}
      />
    ))
  );
}

export default withGraphSettings(
  withComponentsData(GraphVertices, ({ handleVertexRemove, verticesData }) => ({
    onRemove: handleVertexRemove,
    verticesData
  })),
  ({ componentsSettings, renderers }) => ({
    renderer: renderers.vertex,
    settings: componentsSettings.vertex
  })
);

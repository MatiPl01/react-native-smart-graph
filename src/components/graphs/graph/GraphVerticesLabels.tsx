import { VertexLabelComponent } from '@/components/graphs/labels';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { GraphVerticesLabelsProps } from '@/types/components';

function GraphVerticesLabels<V>({
  focusContext,
  // settings,
  renderer,
  vertexLabelsData,
  vertexRadius
}: GraphVerticesLabelsProps<V>) {
  return (
    renderer &&
    Object.entries(vertexLabelsData).map(([key, data]) => (
      <VertexLabelComponent<V>
        data={data}
        focusContext={focusContext}
        key={key}
        renderer={renderer}
        vertexKey={key}
        vertexRadius={vertexRadius}
      />
    ))
  );
}

export default withGraphSettings(
  withComponentsData(GraphVerticesLabels, ({ vertexLabelsData }) => ({
    vertexLabelsData
  })),
  ({ componentsSettings, renderers }) => ({
    renderer: renderers.vertexLabel,
    settings: componentsSettings.vertexLabel,
    vertexRadius: componentsSettings.vertex.radius
  })
);

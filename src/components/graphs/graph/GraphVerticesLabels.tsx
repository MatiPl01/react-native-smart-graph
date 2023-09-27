import { VertexLabelComponent } from '@/components/graphs/labels';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { GraphVerticesLabelsProps } from '@/types/components';

function GraphVerticesLabels<V>({
  focusContext,
  labelPosition,
  multiStepFocusContext,
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
        labelPosition={labelPosition}
        multiStepFocusContext={multiStepFocusContext}
        renderer={renderer}
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
    labelPosition: componentsSettings.vertexLabel?.position,
    renderer: renderers.vertexLabel,
    vertexRadius: componentsSettings.vertex.radius
  })
);

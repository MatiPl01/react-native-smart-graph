import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { GraphVerticesLabelsProps } from '@/types/components';

function GraphVerticesLabels<V>(props: GraphVerticesLabelsProps<V>) {
  console.log(Object.keys(props.vertexLabelsData));
  return null;
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

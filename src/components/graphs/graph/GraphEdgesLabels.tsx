import { Group } from '@shopify/react-native-skia';

import { EdgeLabelComponent } from '@/components/graphs';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { GraphEdgeLabelsProps } from '@/types/components';

function GraphEdgeLabels<E>({
  edgeLabelsData,
  focusProgress,
  renderer,
  vertexRadius
}: GraphEdgeLabelsProps<E>) {
  return (
    renderer && (
      <Group opacity={focusProgress}>
        {Object.entries(edgeLabelsData).map(([key, data]) => (
          <EdgeLabelComponent<E>
            data={data}
            edgeKey={key}
            key={key}
            renderer={renderer}
            vertexRadius={vertexRadius}
          />
        ))}
      </Group>
    )
  );
}

export default withGraphSettings(
  withComponentsData(GraphEdgeLabels, ({ edgeLabelsData }) => ({
    edgeLabelsData
  })),
  ({ componentsSettings, renderers }) => ({
    renderer: renderers.edgeLabel,
    vertexRadius: componentsSettings.vertex.radius
  })
);

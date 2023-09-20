import { Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { EdgeLabelComponent } from '@/components/graphs';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { EdgeLabelRenderer } from '@/types/components';
import { EdgeLabelComponentData } from '@/types/data';

type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  focusProgress: SharedValue<number>;
  renderer: EdgeLabelRenderer<E> | null;
  vertexRadius: number;
};

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
            value={data.value}
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

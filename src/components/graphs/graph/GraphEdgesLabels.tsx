import { Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { LabelComponent } from '@/components/graphs/labels';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { LabelRenderer } from '@/types/components';
import { LabelComponentData } from '@/types/data';

type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, LabelComponentData<E>>;
  focusProgress: SharedValue<number>;
  renderer: LabelRenderer<E>;
  vertexRadius: number;
};

function GraphEdgeLabels<E>({
  edgeLabelsData,
  focusProgress,
  renderer,
  vertexRadius
}: GraphEdgeLabelsProps<E>) {
  return renderer ? (
    <Group opacity={focusProgress}>
      {Object.entries(edgeLabelsData).map(([key, data]) => (
        <LabelComponent<E>
          data={data}
          edgeKey={key}
          key={key}
          renderer={renderer}
          vertexRadius={vertexRadius}
        />
      ))}
    </Group>
  ) : null;
}

export default withGraphSettings(
  withComponentsData(GraphEdgeLabels, ({ edgeLabelsData }) => ({
    edgeLabelsData
  })),
  ({ componentSettings, renderers }) => ({
    renderer: renderers.label,
    vertexRadius: componentSettings.vertex.radius
  })
);

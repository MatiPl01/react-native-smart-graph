import { Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { LabelComponent } from '@/components/graphs/labels';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { LabelRenderer } from '@/types/components';
import { LabelComponentData } from '@/types/data';

type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, LabelComponentData<E>>;
  focusProgress: SharedValue<number>;
  renderer: LabelRenderer<E> | null;
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
          <LabelComponent<E>
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
    renderer: renderers.label,
    vertexRadius: componentsSettings.vertex.radius
  })
);

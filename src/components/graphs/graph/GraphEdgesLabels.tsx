import { Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import EdgeLabelComponent from '@/components/graphs/labels/EdgeLabelComponent';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';
import { EdgeLabelRendererFunction } from '@/types/renderers';
import { withComponentsData } from '@/providers/graph/data/components/context';
import { withGraphSettings } from '@/providers/graph/data/settings/context';

type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  focusProgress: SharedValue<number>;
  renderer: EdgeLabelRendererFunction<E>;
};

function GraphEdgeLabels<E>({
  edgeLabelsData,
  focusProgress,
  renderer
}: GraphEdgeLabelsProps<E>) {
  return (
    <Group opacity={focusProgress}>
      {Object.entries(edgeLabelsData).map(([key, data]) =>
        renderer ? (
          <EdgeLabelComponent
            edgeKey={key}
            key={key}
            {...data}
            renderer={renderer}
          />
        ) : null
      )}
    </Group>
  );
}

export default withGraphSettings(
  withComponentsData(GraphEdgeLabels, ({ edgeLabelsData }) => ({
    edgeLabelsData
  })),
  ({ renderers }) => ({
    renderer: renderers.label
  })
);

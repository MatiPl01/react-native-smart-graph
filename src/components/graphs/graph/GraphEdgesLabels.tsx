import { Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import EdgeLabelComponent from '@/components/graphs/labels/EdgeLabelComponent';
import { withGraphData } from '@/providers/graph';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';
import { EdgeLabelRendererFunction } from '@/types/renderer';

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

export default withGraphData(
  GraphEdgeLabels,
  ({ edgeLabelsData, renderers }) => ({
    edgeLabelsData,
    renderer: renderers.label
  })
);

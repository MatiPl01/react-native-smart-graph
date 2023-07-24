import { Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import EdgeLabelComponent from '@/components/graphs/labels/EdgeLabelComponent';
import { withGraphData } from '@/providers/graph';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';

type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  focusProgress: SharedValue<number>;
};

function GraphEdgeLabels<E>({
  edgeLabelsData,
  focusProgress
}: GraphEdgeLabelsProps<E>) {
  return (
    <Group opacity={focusProgress}>
      {Object.entries(edgeLabelsData).map(([key, data]) => (
        <EdgeLabelComponent edgeKey={key} key={key} {...data} />
      ))}
    </Group>
  );
}

export default withGraphData(GraphEdgeLabels, ({ edgeLabelsData }) => ({
  edgeLabelsData
}));

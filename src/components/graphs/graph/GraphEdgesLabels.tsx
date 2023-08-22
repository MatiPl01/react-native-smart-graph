import { SharedValue } from 'react-native-reanimated';

import { LabelComponent } from '@/components/graphs/labels';
import { Box } from '@/components/utils';
import { withComponentsData, withGraphSettings } from '@/providers/graph';
import { LabelRenderer } from '@/types/components';
import { LabelComponentData } from '@/types/data';

type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, LabelComponentData<E>>;
  focusProgress: SharedValue<number>;
  renderer: LabelRenderer<E>;
};

function GraphEdgeLabels<E>({
  edgeLabelsData,
  focusProgress,
  renderer
}: GraphEdgeLabelsProps<E>) {
  return renderer ? (
    <Box opacity={focusProgress}>
      {Object.entries(edgeLabelsData).map(([key, data]) => (
        <LabelComponent<E>
          {...data}
          edgeKey={key}
          key={key}
          renderer={renderer}
        />
      ))}
    </Box>
  ) : null;
}

export default withGraphSettings(
  withComponentsData(GraphEdgeLabels, ({ edgeLabelsData }) => ({
    edgeLabelsData
  })),
  ({ renderers }) => ({
    renderer: renderers.label
  })
);

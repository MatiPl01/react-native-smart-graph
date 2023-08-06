import { Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { LabelComponent } from '@/components/graphs/labels';
import { withComponentsData } from '@/providers/graph/data/components/context';
import { withGraphSettings } from '@/providers/graph/data/settings/context';
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
  return (
    <Group opacity={focusProgress}>
      {Object.entries(edgeLabelsData).map(([key, data]) =>
        renderer ? (
          <LabelComponent
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

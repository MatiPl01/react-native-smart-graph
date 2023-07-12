import { Group } from '@shopify/react-native-skia';
import {
  interpolate,
  SharedValue,
  useDerivedValue
} from 'react-native-reanimated';

import EdgeComponent from '@/components/graphs/edges/EdgeComponent';
import { withGraphData } from '@/providers/graph';
import {
  EdgeComponentData,
  EdgeComponentProps,
  EdgeRemoveHandler,
  EdgeRenderHandler
} from '@/types/components';

type GraphEdgesProps<E, V> = {
  edgesData: Record<string, EdgeComponentData<E, V>>;
  focusProgress: SharedValue<number>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
};

function GraphEdges<E, V>({
  edgesData,
  focusProgress,
  handleEdgeRemove,
  handleEdgeRender
}: GraphEdgesProps<E, V>) {
  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  return (
    <Group opacity={opacity}>
      {Object.values(edgesData).map(data => (
        <EdgeComponent
          {...({
            ...data,
            key: data.edge.key,
            onRemove: handleEdgeRemove,
            onRender: handleEdgeRender
          } as unknown as EdgeComponentProps<E, V>)}
        />
      ))}
    </Group>
  );
}

export default withGraphData(
  GraphEdges,
  ({ edgesData, handleEdgeRemove, handleEdgeRender }) => ({
    edgesData,
    handleEdgeRemove,
    handleEdgeRender
  })
);

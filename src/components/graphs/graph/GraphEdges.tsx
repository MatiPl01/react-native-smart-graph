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
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';

type GraphEdgesProps<
  E,
  V,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  edgesData: Record<string, EdgeComponentData<E, V, ED>>;
  focusProgress: SharedValue<number>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
};

function GraphEdges<
  E,
  V,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  edgesData,
  focusProgress,
  handleEdgeRemove,
  handleEdgeRender
}: GraphEdgesProps<E, V, ED>) {
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

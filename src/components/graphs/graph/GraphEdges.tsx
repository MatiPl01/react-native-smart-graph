import { Group } from '@shopify/react-native-skia';
import {
  interpolate,
  SharedValue,
  useDerivedValue
} from 'react-native-reanimated';

import EdgeComponent from '@/components/graphs/edges/EdgeComponent';
import { withComponentsData } from '@/providers/graph';
import {
  EdgeComponentData,
  EdgeComponentProps,
  EdgeRemoveHandler
} from '@/types/components';

type GraphEdgesProps<E, V> = Pick<
  EdgeComponentProps<E, V>,
  'arrowRenderer' | 'edgeRenderer' | 'labelRenderer'
> & {
  edgesData: Record<string, EdgeComponentData<E, V>>;
  focusProgress: SharedValue<number>;
  onRemove: EdgeRemoveHandler;
};

function GraphEdges<E, V>({
  edgesData,
  focusProgress,
  ...restProps
}: GraphEdgesProps<E, V>) {
  const opacity = useDerivedValue(() =>
    interpolate(focusProgress.value, [0, 1], [0.5, 1])
  );

  return (
    <Group opacity={opacity}>
      {Object.values(edgesData).map(data => (
        <EdgeComponent
          {...({
            ...restProps,
            ...data,
            key: data.edge.key
          } as unknown as EdgeComponentProps<E, V>)}
        />
      ))}
    </Group>
  );
}

export default withComponentsData(
  GraphEdges,
  ({ edgesData, handleEdgeRemove, renderers, settings }) => {
    const { vertex: _, ...componentSettings } = settings.components;

    return {
      arrowRenderer: renderers.arrow,
      componentSettings,
      edgeRenderer: renderers.edge,
      edgesData,
      labelRenderer: renderers.label,
      onRemove: handleEdgeRemove
    };
  }
);

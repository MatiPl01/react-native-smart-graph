import { Group } from '@shopify/react-native-skia';
import {
  interpolate,
  SharedValue,
  useDerivedValue
} from 'react-native-reanimated';

import EdgeComponent from '@/components/graphs/edges/EdgeComponent';
import {
  EdgeComponentData,
  EdgeComponentProps,
  EdgeRemoveHandler
} from '@/types/components';
import { withComponentsData } from '@/providers/graph/data/components/context';
import {
  GraphSettingsContextType,
  withGraphSettings
} from '@/providers/graph/data/settings/context';

type ComponentsSettings<V, E> = GraphSettingsContextType<
  V,
  E
>['settings']['components'];

type GraphEdgesProps<V, E> = Pick<
  EdgeComponentProps<V, E>,
  'arrowRenderer' | 'edgeRenderer' | 'labelRenderer'
> & {
  edgesData: Record<string, EdgeComponentData<V, E>>;
  focusProgress: SharedValue<number>;
  onRemove: EdgeRemoveHandler;
  edgeSettings: ComponentsSettings<V, E>['edge'];
  arrowSettings: ComponentsSettings<V, E>['arrow'];
  labelSettings: ComponentsSettings<V, E>['label'];
};

function GraphEdges<V, E>({
  edgesData,
  focusProgress,
  ...restProps
}: GraphEdgesProps<V, E>) {
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
          } as unknown as EdgeComponentProps<V, E>)}
        />
      ))}
    </Group>
  );
}

export default withGraphSettings(
  withComponentsData(GraphEdges, ({ edgesData, handleEdgeRemove }) => ({
    edgesData,
    onRemove: handleEdgeRemove
  })),
  ({ settings, renderers }) => ({
    arrowRenderer: renderers.arrow,
    edgeRenderer: renderers.edge,
    labelRenderer: renderers.label,
    arrowSettings: settings.components.arrow,
    edgeSettings: settings.components.edge,
    labelSettings: settings.components.label
  })
);

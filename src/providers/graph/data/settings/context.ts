import { Context, createContext } from 'react';

import { EdgeType, LayoutType } from '@/types/settings';
import { DeepSharedify } from '@/types/utils';
import { withMemoContext } from '@/utils/contexts';

export type GraphSettingsContextType<V, E> = {
  graph: Graph<V, E>;
  renderers: GraphRenderersWithDefaults<V, E>;
  settings: {
    animations: GraphAnimationsSettingsWithDefaults;
    components: DeepSharedify<
      Omit<GraphSettingsWithDefaults<V>['components'], 'edge'>
    > & {
      edge: DeepSharedify<
        Omit<GraphSettingsWithDefaults<V>['components']['edge'], 'type'>
      > & {
        type: EdgeType;
      };
    };
    events?: GraphSettingsWithDefaults<V>['events'];
    layout: DeepSharedify<
      Omit<GraphSettingsWithDefaults<V>['layout'], 'type'>
    > & {
      type: LayoutType;
    };
  } & DeepSharedify<Pick<GraphSettingsWithDefaults<V>, 'placement'>>;
};

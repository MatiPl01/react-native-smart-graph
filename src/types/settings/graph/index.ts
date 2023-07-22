import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';

import {
  GraphAnimationsSettings,
  GraphAnimationsSettingsWithDefaults
} from './animations';
import {
  DirectedGraphComponentsSettings,
  DirectedGraphComponentsSettingsWithDefaults,
  UndirectedGraphComponentsSettings,
  UndirectedGraphComponentsSettingsWithDefaults
} from './components';
import { GraphEventsSettings } from './events';
import { GraphLayoutSettings, GraphLayoutSettingsWithDefaults } from './layout';
import {
  GraphPlacementSettings,
  UnboundRandomPlacementSettingsWithDefaults
} from './placement';

export * from './animations';
export * from './components';
export * from './events';
export * from './layout';
export * from './placement';

type SharedGraphSettings<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  animations?: GraphAnimationsSettings;
  events?: GraphEventsSettings<V>;
  layout?: GraphLayoutSettings;
  placement?: GraphPlacementSettings;
};

export type DirectedGraphSettings<V, E> = SharedGraphSettings<
  V,
  E,
  DirectedEdgeData<E>
> & {
  components?: DirectedGraphComponentsSettings;
};

export type UndirectedGraphSettings<V, E> = SharedGraphSettings<
  V,
  E,
  UndirectedEdgeData<E>
> & {
  components?: UndirectedGraphComponentsSettings;
};

export type GraphSettings<V, E> =
  | DirectedGraphSettings<V, E>
  | UndirectedGraphSettings<V, E>;

export type GraphSettingsWithDefaults<V, E> = (
  | (Omit<DirectedGraphSettings<V, E>, 'animations'> & {
      components: DirectedGraphComponentsSettingsWithDefaults;
    })
  | (Omit<UndirectedGraphSettings<V, E>, 'animations'> & {
      components: UndirectedGraphComponentsSettingsWithDefaults;
    })
) & {
  animations: GraphAnimationsSettingsWithDefaults;
  layout: GraphLayoutSettingsWithDefaults;
  placement:
    | GraphPlacementSettings
    | UnboundRandomPlacementSettingsWithDefaults;
};

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

export * from './components';
export * from './events';
export * from './placement';

type SharedGraphSettings<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  animations?: GraphAnimationsSettings;
  events?: GraphEventsSettings<V, E, ED>;
  layout?: GraphLayoutSettings;
  placement?: GraphPlacementSettings<V, E>;
};

export type DirectedGraphSettings<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = SharedGraphSettings<V, E, ED> & {
  components?: DirectedGraphComponentsSettings;
};

export type UndirectedGraphSettings<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = SharedGraphSettings<V, E, ED> & {
  components?: UndirectedGraphComponentsSettings;
};

export type GraphSettings<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = DirectedGraphSettings<V, E, ED> | UndirectedGraphSettings<V, E, ED>;

export type GraphSettingsWithDefaults<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = (
  | (DirectedGraphSettings<V, E, ED> & {
      components: DirectedGraphComponentsSettingsWithDefaults;
    })
  | (UndirectedGraphSettings<V, E, ED> & {
      components: UndirectedGraphComponentsSettingsWithDefaults;
    })
) & {
  animations: GraphAnimationsSettingsWithDefaults;
  layout: GraphLayoutSettingsWithDefaults;
  placement:
    | GraphPlacementSettings<V, E>
    | UnboundRandomPlacementSettingsWithDefaults;
};

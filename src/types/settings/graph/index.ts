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
import { GraphLayoutSettings, GraphLayoutSettingsWithDefaults } from './layout';
import {
  GraphPlacementSettings,
  UnboundRandomPlacementSettingsWithDefaults
} from './placement';

export * from './components';
export * from './placement';

type SharedGraphSettings<V, E> = {
  animations?: GraphAnimationsSettings;
  layout?: GraphLayoutSettings;
  placement?: GraphPlacementSettings<V, E>;
};

export type DirectedGraphSettings<V, E> = SharedGraphSettings<V, E> & {
  components?: DirectedGraphComponentsSettings;
};

export type UndirectedGraphSettings<V, E> = SharedGraphSettings<V, E> & {
  components?: UndirectedGraphComponentsSettings;
};

export type GraphSettings<V, E> =
  | DirectedGraphSettings<V, E>
  | UndirectedGraphSettings<V, E>;

export type GraphSettingsWithDefaults<V, E> = (
  | (DirectedGraphSettings<V, E> & {
      components: DirectedGraphComponentsSettingsWithDefaults;
    })
  | (UndirectedGraphSettings<V, E> & {
      components: UndirectedGraphComponentsSettingsWithDefaults;
    })
) & {
  animations: GraphAnimationsSettingsWithDefaults;
  layout: GraphLayoutSettingsWithDefaults;
  placement:
    | GraphPlacementSettings<V, E>
    | UnboundRandomPlacementSettingsWithDefaults;
};

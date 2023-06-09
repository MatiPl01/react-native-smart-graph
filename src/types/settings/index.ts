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
import { ForcesSettings, ForcesSettingsWithDefaults } from './forces';
import {
  DirectedGraphPlacementSettings,
  UndirectedGraphPlacementSettings
} from './placement';

export * from './components';
export * from './placement';

type SharedGraphSettings = {
  animations?: GraphAnimationsSettings;
};

export type DirectedGraphSettings<V, E> = SharedGraphSettings & {
  placement?: DirectedGraphPlacementSettings<V, E>;
  components?: DirectedGraphComponentsSettings;
};

export type UndirectedGraphSettings<V, E> = SharedGraphSettings & {
  placement?: UndirectedGraphPlacementSettings<V, E>;
  components?: UndirectedGraphComponentsSettings;
};

export type GraphSettings<V, E> = (
  | DirectedGraphSettings<V, E>
  | UndirectedGraphSettings<V, E>
) & {
  forces?: ForcesSettings;
};

export type GraphSettingsWithDefaults<V, E> = (
  | (DirectedGraphSettings<V, E> & {
      components: DirectedGraphComponentsSettingsWithDefaults;
    })
  | (UndirectedGraphSettings<V, E> & {
      components: UndirectedGraphComponentsSettingsWithDefaults;
    })
) & {
  animations: GraphAnimationsSettingsWithDefaults;
  forces: ForcesSettingsWithDefaults;
};

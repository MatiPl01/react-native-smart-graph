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

export type DirectedGraphSettings<V, E> = {
  placement?: DirectedGraphPlacementSettings<V, E>;
  components?: DirectedGraphComponentsSettings;
};

export type UndirectedGraphSettings<V, E> = {
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
  forces: ForcesSettingsWithDefaults;
};

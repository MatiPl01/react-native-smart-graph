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
import { MultiStepFocusSettings } from './focus';
import { GraphLayoutSettings, GraphLayoutSettingsWithDefaults } from './layout';
import {
  GraphPlacementSettings,
  UnboundRandomPlacementSettingsWithDefaults
} from './placement';

export * from './animations';
export * from './components';
export * from './events';
export * from './focus';
export * from './layout';
export * from './placement';

type SharedGraphSettings<V> = {
  animations?: GraphAnimationsSettings;
  events?: GraphEventsSettings<V>;
  focus?: MultiStepFocusSettings;
  layout?: GraphLayoutSettings;
  placement?: GraphPlacementSettings;
};

export type DirectedGraphSettings<V> = SharedGraphSettings<V> & {
  components?: DirectedGraphComponentsSettings;
};

export type UndirectedGraphSettings<V> = SharedGraphSettings<V> & {
  components?: UndirectedGraphComponentsSettings;
};

export type GraphSettings<V> =
  | DirectedGraphSettings<V>
  | UndirectedGraphSettings<V>;

export type GraphSettingsWithDefaults<V> = (
  | (Omit<DirectedGraphSettings<V>, 'animations' | 'components'> & {
      components: DirectedGraphComponentsSettingsWithDefaults;
    })
  | (Omit<UndirectedGraphSettings<V>, 'animations' | 'components'> & {
      components: UndirectedGraphComponentsSettingsWithDefaults;
    })
) & {
  animations: GraphAnimationsSettingsWithDefaults;
  layout: GraphLayoutSettingsWithDefaults;
  placement:
    | GraphPlacementSettings
    | UnboundRandomPlacementSettingsWithDefaults;
};

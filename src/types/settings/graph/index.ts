import { DeepRequiredAll } from '@/types/utils';
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
  GraphPlacementSettingsWithDefaults,
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
  | UndirectedGraphSettings<V>;]

export type SharedDefaultGraphSettings = {
  animations: GraphAnimationsSettingsWithDefaults;
  layout: GraphLayoutSettingsWithDefaults;
  placement: GraphPlacementSettingsWithDefaults;
};

export type DirectedGraphSettingsWithDefaults<V> = SharedDefaultGraphSettings &
  Omit<DirectedGraphSettings<V>, 'animations' | 'components'> & {
    components: DirectedGraphComponentsSettingsWithDefaults;
  };

export type UndirectedGraphSettingsWithDefaults<V> =
  SharedDefaultGraphSettings &
    Omit<UndirectedGraphSettings<V>, 'animations' | 'components'> & {
      components: UndirectedGraphComponentsSettingsWithDefaults;
    };

export type GraphSettingsWithDefaults<V> =
  | DirectedGraphSettingsWithDefaults<V>
  | UndirectedGraphSettingsWithDefaults<V>;

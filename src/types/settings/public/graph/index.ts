import { GraphAnimationsSettings } from './animations';
import {
  DirectedGraphWithCurvedEdgesComponentsSettings,
  DirectedGraphWithStraightEdgesComponentsSettings,
  UndirectedGraphWithCurvedEdgesComponentsSettings,
  UndirectedGraphWithStraightEdgesComponentsSettings
} from './components';
import { GraphEventsSettings } from './events';
import { MultiStepFocusSettings } from './focus';
import { GraphLayoutSettings } from './layout';
import { GraphPlacementSettings } from './placement';

type SharedGraphSettings<V> = {
  animations?: GraphAnimationsSettings;
  events?: GraphEventsSettings<V>;
  focus?: MultiStepFocusSettings;
  layout?: GraphLayoutSettings;
  placement?: GraphPlacementSettings;
};

export type UndirectedGraphWithStraightEdgeSettings<V> =
  SharedGraphSettings<V> & {
    components?: UndirectedGraphWithStraightEdgesComponentsSettings;
  };

export type UndirectedGraphWithCurvedEdgeSettings<V> =
  SharedGraphSettings<V> & {
    components?: UndirectedGraphWithCurvedEdgesComponentsSettings;
  };

export type DirectedGraphWithStraightEdgeSettings<V> =
  SharedGraphSettings<V> & {
    components?: DirectedGraphWithStraightEdgesComponentsSettings;
  };

export type DirectedGraphWithCurvedEdgeSettings<V> = SharedGraphSettings<V> & {
  components?: DirectedGraphWithCurvedEdgesComponentsSettings;
};

export type UndirectedGraphSettings<V = void> =
  | UndirectedGraphWithCurvedEdgeSettings<V>
  | UndirectedGraphWithStraightEdgeSettings<V>;

export type DirectedGraphSettings<V = void> =
  | DirectedGraphWithCurvedEdgeSettings<V>
  | DirectedGraphWithStraightEdgeSettings<V>;

export type GraphSettings<V = void> =
  | DirectedGraphSettings<V>
  | UndirectedGraphSettings<V>;

export * from './animations';
export * from './components';
export * from './events';
export * from './focus';
export * from './layout';
export * from './placement';

import { GraphAnimationsSettings } from './animations';
import {
  DirectedGraphWithCurvedEdgesComponentsSettings,
  DirectedGraphWithStraightEdgesComponentsSettings,
  EdgeType,
  UndirectedGraphWithCurvedEdgesComponentsSettings,
  UndirectedGraphWithStraightEdgesComponentsSettings
} from './components';
import { GraphEventsSettings } from './events';
import { MultiStepFocusSettings } from './focus';
import { GraphLayoutSettings } from './layout';
import { GraphPlacementSettings } from './placement';

type SharedGraphSettings<V> = {
  animationSettings?: GraphAnimationsSettings;
  edgeType?: EdgeType;
  eventSettings?: GraphEventsSettings<V>;
  focusSettings?: MultiStepFocusSettings;
  layoutSettings?: GraphLayoutSettings;
  placementSettings?: GraphPlacementSettings;
};

export type UndirectedGraphWithStraightEdgeSettings<V> =
  SharedGraphSettings<V> & {
    componentSettings?: UndirectedGraphWithStraightEdgesComponentsSettings;
  };

export type UndirectedGraphWithCurvedEdgeSettings<V> =
  SharedGraphSettings<V> & {
    componentSettings?: UndirectedGraphWithCurvedEdgesComponentsSettings;
  };

export type DirectedGraphWithStraightEdgeSettings<V> =
  SharedGraphSettings<V> & {
    componentSettings?: DirectedGraphWithStraightEdgesComponentsSettings;
  };

export type DirectedGraphWithCurvedEdgeSettings<V> = SharedGraphSettings<V> & {
  componentSettings?: DirectedGraphWithCurvedEdgesComponentsSettings;
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

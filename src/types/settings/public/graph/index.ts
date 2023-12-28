import { AnimationSettings, GraphAnimationsSettings } from './animations';
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
  animationSettings?: AnimationSettings | GraphAnimationsSettings;
  edgeType?: EdgeType;
  eventSettings?: GraphEventsSettings<V>;
  focusSettings?: MultiStepFocusSettings;
  layoutSettings?: GraphLayoutSettings;
  placementSettings?: GraphPlacementSettings;
  useContextBridge?: boolean;
};

export type UndirectedGraphWithStraightEdgeSettings<V> =
  SharedGraphSettings<V> & {
    componentsSettings?: UndirectedGraphWithStraightEdgesComponentsSettings;
  };

export type UndirectedGraphWithCurvedEdgeSettings<V> =
  SharedGraphSettings<V> & {
    componentsSettings?: UndirectedGraphWithCurvedEdgesComponentsSettings;
  };

export type DirectedGraphWithStraightEdgeSettings<V> =
  SharedGraphSettings<V> & {
    componentsSettings?: DirectedGraphWithStraightEdgesComponentsSettings;
  };

export type DirectedGraphWithCurvedEdgeSettings<V> = SharedGraphSettings<V> & {
  componentsSettings?: DirectedGraphWithCurvedEdgesComponentsSettings;
};

export type UndirectedGraphSettings<V = unknown> =
  | UndirectedGraphWithCurvedEdgeSettings<V>
  | UndirectedGraphWithStraightEdgeSettings<V>;

export type DirectedGraphSettings<V = unknown> =
  | DirectedGraphWithCurvedEdgeSettings<V>
  | DirectedGraphWithStraightEdgeSettings<V>;

export type GraphSettings<V = unknown> =
  | DirectedGraphSettings<V>
  | UndirectedGraphSettings<V>;

export * from './animations';
export * from './components';
export * from './events';
export * from './focus';
export * from './layout';
export * from './placement';

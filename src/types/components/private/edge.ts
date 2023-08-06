/* eslint-disable import/no-unused-modules */
import { SharedValue } from 'react-native-reanimated';

import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers,
  UndirectedGraphWithCurvedEdgeRenderers,
  UndirectedGraphWithStraightEdgeRenderers
} from '@/types/components/public';
import { EdgeComponentData, EdgeRemoveHandler } from '@/types/data';
import { DirectedEdge, UndirectedEdge } from '@/types/models';
import {
  AllArrowSettings,
  AllEdgeSettings,
  AllLabelSettings,
  InternalDirectedCurvedEdgeSettings,
  InternalDirectedStraightEdgeSettings,
  InternalUndirectedCurvedEdgeSettings,
  InternalUndirectedStraightEdgeSettings
} from '@/types/settings';

import { AllGraphRenderers } from './renderers';

type SharedEdgeComponentProps = {
  animatedEdgesCount: SharedValue<number>;
  animatedOrder: SharedValue<number>;
};

export type DirectedStraightEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    data: EdgeComponentData<DirectedEdge<V, E>>;
    renderers: DirectedGraphWithStraightEdgeRenderers<V, E>;
    settings: InternalDirectedStraightEdgeSettings;
  };

export type DirectedCurvedEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    data: EdgeComponentData<DirectedEdge<V, E>>;
    renderers: DirectedGraphWithCurvedEdgeRenderers<V, E>;
    settings: InternalDirectedCurvedEdgeSettings;
  };

export type UndirectedStraightEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    data: EdgeComponentData<UndirectedEdge<V, E>>;
    renderers: UndirectedGraphWithStraightEdgeRenderers<V, E>;
    settings: InternalUndirectedStraightEdgeSettings;
  };

export type UndirectedCurvedEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    data: EdgeComponentData<UndirectedEdge<V, E>>;
    renderers: UndirectedGraphWithCurvedEdgeRenderers<V, E>;
    settings: InternalUndirectedCurvedEdgeSettings;
  };

export type DirectedEdgeComponentProps<V, E> =
  | DirectedCurvedEdgeComponentProps<V, E>
  | DirectedStraightEdgeComponentProps<V, E>;

export type UndirectedEdgeComponentProps<V, E> =
  | UndirectedCurvedEdgeComponentProps<V, E>
  | UndirectedStraightEdgeComponentProps<V, E>;

export type InnerEdgeComponentProps<V, E> =
  | DirectedEdgeComponentProps<V, E>
  | UndirectedEdgeComponentProps<V, E>;

export type EdgeComponentProps<V, E> = Omit<
  InnerEdgeComponentProps<V, E>,
  'animatedEdgesCount' | 'animatedOrder' | 'renderers'
> & {
  edgesCount: SharedValue<number>;
  onRemove: EdgeRemoveHandler;
  order: SharedValue<number>;
  removed: boolean;
  renderers: AllGraphRenderers<V, E>;
};

export type GraphEdgesProps<V, E> = Omit<
  EdgeComponentProps<V, E>,
  'renderers' | 'settings'
> & {
  arrowSettings: AllArrowSettings;
  edgeSettings: AllEdgeSettings;
  edgesData:
    | Record<string, EdgeComponentData<DirectedEdge<V, E>>>
    | Record<string, EdgeComponentData<UndirectedEdge<V, E>>>;
  focusProgress: SharedValue<number>;
  labelSettings: AllLabelSettings;
  onRemove: EdgeRemoveHandler;
};

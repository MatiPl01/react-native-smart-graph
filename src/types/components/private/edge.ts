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
  AllCurvedEdgeSettings,
  AllLabelSettings,
  AllStraightEdgeSettings,
  InternalDirectedCurvedEdgeSettings,
  InternalDirectedStraightEdgeSettings,
  InternalUndirectedCurvedEdgeSettings,
  InternalUndirectedStraightEdgeSettings
} from '@/types/settings';

import {
  AllDirectedGraphRenderers,
  AllUndirectedGraphRenderers
} from './renderers';

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

export type EdgeComponentProps<
  V,
  E,
  P extends InnerEdgeComponentProps<V, E>
> = Omit<P, 'animatedEdgesCount' | 'animatedOrder' | 'renderers'> & {
  edgesCount: SharedValue<number>;
  onRemove: EdgeRemoveHandler;
  order: SharedValue<number>;
  removed: boolean;
  renderers: P extends
    | DirectedCurvedEdgeComponentProps<V, E>
    | DirectedStraightEdgeComponentProps<V, E>
    ? AllDirectedGraphRenderers<V, E>
    : AllUndirectedGraphRenderers<V, E>;
};

export type GraphEdgesProps<
  V,
  E,
  P extends InnerEdgeComponentProps<V, E>
> = Omit<EdgeComponentProps<V, E, P>, 'renderers' | 'settings'> & {
  arrowSettings: AllArrowSettings;
  edgeSettings: P extends
    | DirectedCurvedEdgeComponentProps<V, E>
    | UndirectedCurvedEdgeComponentProps<V, E>
    ? AllCurvedEdgeSettings
    : AllStraightEdgeSettings;
  edgesData: Record<string, P['data']>;
  focusProgress: SharedValue<number>;
  labelSettings: AllLabelSettings;
  onRemove: EdgeRemoveHandler;
};

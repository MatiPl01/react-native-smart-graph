/* eslint-disable import/no-unused-modules */
import { SharedValue } from 'react-native-reanimated';

import {
  ArrowRenderer,
  CurvedEdgeRenderer,
  LabelRenderer,
  StraightEdgeRenderer
} from '@/types/components/public';
import { EdgeComponentData, EdgeRemoveHandler } from '@/types/data';
import {
  InternalArrowSettings,
  InternalDirectedCurvedEdgeSettings,
  InternalDirectedStraightEdgeSettings,
  InternalEdgeSettings,
  InternalLabelSettings,
  InternalUndirectedCurvedEdgeSettings,
  InternalUndirectedStraightEdgeSettings
} from '@/types/settings';

import {
  AllDirectedGraphWithCurvedEdgeRenderers,
  AllDirectedGraphWithStraightEdgeRenderers,
  AllUndirectedGraphWithCurvedEdgeRenderers,
  AllUndirectedGraphWithStraightEdgeRenderers
} from './renderers';

type SharedEdgeComponentProps = {
  animatedEdgesCount: SharedValue<number>;
  animatedOrder: SharedValue<number>;
};

export type DirectedStraightEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: AllDirectedGraphWithStraightEdgeRenderers<V, E>;
    settings: InternalDirectedStraightEdgeSettings;
  };

export type DirectedCurvedEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: AllDirectedGraphWithCurvedEdgeRenderers<V, E>;
    settings: InternalDirectedCurvedEdgeSettings;
  };

export type UndirectedStraightEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: AllUndirectedGraphWithStraightEdgeRenderers<V, E>;
    settings: InternalUndirectedStraightEdgeSettings;
  };

export type UndirectedCurvedEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: AllUndirectedGraphWithCurvedEdgeRenderers<V, E>;
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
  'animatedEdgesCount' | 'animatedOrder' | 'renderers' | 'settings'
> & {
  onRemove: EdgeRemoveHandler;
  renderers: {
    arrow?: ArrowRenderer;
    edge: CurvedEdgeRenderer<E> | StraightEdgeRenderer<E>;
    label?: LabelRenderer<E>;
  };
  settings: {
    arrow?: InternalArrowSettings;
    edge: InternalEdgeSettings;
    label?: InternalLabelSettings;
  };
};

export type GraphEdgesProps<V, E> = Omit<
  EdgeComponentProps<V, E>,
  'data' | 'renderers' | 'settings'
> & {
  arrowRenderer?: ArrowRenderer;
  arrowSettings: InternalArrowSettings;
  edgeRenderer: CurvedEdgeRenderer<E> | StraightEdgeRenderer<E>;
  edgeSettings: InternalEdgeSettings;
  edgesData: Record<string, EdgeComponentData<E>>;
  focusProgress: SharedValue<number>;
  labelRenderer: LabelRenderer<E>;
  labelSettings: InternalLabelSettings;
  onRemove: EdgeRemoveHandler;
};

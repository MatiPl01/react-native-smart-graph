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
  focusProgress: SharedValue<number>;
};

type SharedStraightEdgeComponentProps = SharedEdgeComponentProps & {
  edgeType: 'straight';
};

type SharedCurvedEdgeComponentProps = SharedEdgeComponentProps & {
  edgeType: 'curved';
};

export type DirectedStraightEdgeComponentProps<V, E> =
  SharedStraightEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: AllDirectedGraphWithStraightEdgeRenderers<V, E>;
    settings: InternalDirectedStraightEdgeSettings;
  };

export type DirectedCurvedEdgeComponentProps<V, E> =
  SharedCurvedEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: AllDirectedGraphWithCurvedEdgeRenderers<V, E>;
    settings: InternalDirectedCurvedEdgeSettings;
  };

export type UndirectedStraightEdgeComponentProps<V, E> =
  SharedStraightEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: AllUndirectedGraphWithStraightEdgeRenderers<V, E>;
    settings: InternalUndirectedStraightEdgeSettings;
  };

export type UndirectedCurvedEdgeComponentProps<V, E> =
  SharedCurvedEdgeComponentProps & {
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
  'renderers' | 'settings'
> & {
  onRemove: EdgeRemoveHandler;
  renderers: {
    arrow?: ArrowRenderer | null;
    edge: CurvedEdgeRenderer<E> | StraightEdgeRenderer<E> | null;
    label?: LabelRenderer<E> | null;
  };
  settings: {
    arrow?: InternalArrowSettings;
    edge: InternalEdgeSettings;
    label?: InternalLabelSettings;
  };
};

export type GraphEdgesProps<V, E> = Omit<
  EdgeComponentProps<V, E>,
  'data' | 'renderers'
> & {
  arrowRenderer?: ArrowRenderer | null;
  edgeRenderer: CurvedEdgeRenderer<E> | StraightEdgeRenderer<E> | null;
  edgesData: Record<string, EdgeComponentData<E>>;
  focusProgress: SharedValue<number>;
  labelRenderer: LabelRenderer<E> | null;
  onRemove: EdgeRemoveHandler;
};

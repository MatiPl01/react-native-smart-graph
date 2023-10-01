import { SharedValue } from 'react-native-reanimated';

import {
  CurvedEdgeRenderer,
  EdgeArrowRenderer,
  StraightEdgeRenderer
} from '@/types/components/public';
import { EdgeComponentData, EdgeRemoveHandler } from '@/types/data';
import {
  InternalDirectedCurvedEdgeSettings,
  InternalDirectedStraightEdgeSettings,
  InternalEdgeArrowSettings,
  InternalEdgeLabelSettings,
  InternalEdgeSettings,
  InternalUndirectedCurvedEdgeSettings,
  InternalUndirectedStraightEdgeSettings,
  InternalVertexSettings
} from '@/types/settings';
import { RendererWithProps } from '@/types/utils';

import {
  InternalDirectedGraphWithCurvedEdgeRenderers,
  InternalDirectedGraphWithStraightEdgeRenderers,
  InternalUndirectedGraphWithCurvedEdgeRenderers,
  InternalUndirectedGraphWithStraightEdgeRenderers
} from './renderers';

type SharedEdgeComponentProps = {
  focusProgress: SharedValue<number>;
  labelsRendered: SharedValue<boolean>;
};

type SharedStraightEdgeComponentProps = SharedEdgeComponentProps & {
  edgeType: 'straight';
};

type SharedCurvedEdgeComponentProps = SharedEdgeComponentProps & {
  edgeType: 'curved';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SelectEdgeRenderers<R extends Record<string, any>> = {
  arrow?: R['edgeArrow'];
  edge: R['edge'];
};

export type DirectedStraightEdgeComponentProps<V, E> =
  SharedStraightEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: SelectEdgeRenderers<
      InternalDirectedGraphWithStraightEdgeRenderers<V, E>
    >;
    settings: InternalDirectedStraightEdgeSettings;
  };

export type DirectedCurvedEdgeComponentProps<V, E> =
  SharedCurvedEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: SelectEdgeRenderers<
      InternalDirectedGraphWithCurvedEdgeRenderers<V, E>
    >;
    settings: InternalDirectedCurvedEdgeSettings;
  };

export type UndirectedStraightEdgeComponentProps<V, E> =
  SharedStraightEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: SelectEdgeRenderers<
      InternalUndirectedGraphWithStraightEdgeRenderers<V, E>
    >;
    settings: InternalUndirectedStraightEdgeSettings;
  };

export type UndirectedCurvedEdgeComponentProps<V, E> =
  SharedCurvedEdgeComponentProps & {
    data: EdgeComponentData<E>;
    renderers: SelectEdgeRenderers<
      InternalUndirectedGraphWithCurvedEdgeRenderers<V, E>
    >;
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
    arrow?: RendererWithProps<EdgeArrowRenderer> | null;
    edge:
      | RendererWithProps<CurvedEdgeRenderer<E>>
      | RendererWithProps<StraightEdgeRenderer<E>>
      | null;
  };
  settings: {
    arrow?: InternalEdgeArrowSettings;
    edge: InternalEdgeSettings;
    label?: InternalEdgeLabelSettings;
    vertex: InternalVertexSettings;
  };
};

export type GraphEdgesProps<V, E> = Omit<
  EdgeComponentProps<V, E>,
  'data' | 'renderers' | 'settings'
> & {
  arrowRenderer?: RendererWithProps<EdgeArrowRenderer> | null;
  arrowSettings: InternalEdgeArrowSettings;
  edgeRenderer:
    | RendererWithProps<CurvedEdgeRenderer<E>>
    | RendererWithProps<StraightEdgeRenderer<E>>
    | null;
  edgeSettings: InternalEdgeSettings;
  edgesData: Record<string, EdgeComponentData<E>>;
  focusProgress: SharedValue<number>;
  labelSettings: InternalEdgeLabelSettings;
  labelsRendered: SharedValue<boolean>;
  onRemove: EdgeRemoveHandler;
  vertexSettings: InternalVertexSettings;
};

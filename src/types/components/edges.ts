import { SharedValue } from 'react-native-reanimated';

import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { DirectedEdge, Edge, UndirectedEdge } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  DirectedStraightEdgeRenderers,
  EdgeArrowRenderFunction,
  EdgeLabelRendererFunction,
  EdgeRenderFunction,
  UndirectedStraightEdgeRenderers
} from '@/types/renderer';
import {
  DirectedCurvedEdgeRenderers,
  UndirectedCurvedEdgeRenderers
} from '@/types/renderer/edges/curved';
import {
  CurvedEdgeSettings,
  EdgeArrowSettings,
  EdgeLabelSettings,
  GraphSettingsWithDefaults,
  StraightEdgeSettings
} from '@/types/settings';
import { AnimationSettingsWithDefaults } from '@/types/settings/animations';

type SharedEdgeComponentProps = {
  animatedEdgesCount: SharedValue<number>;
  animatedOrder: SharedValue<number>;
  animationProgress: SharedValue<number>;
  animationSettings: AnimationSettingsWithDefaults;
  onRender: EdgeRenderHandler;
  v1Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Position: AnimatedVectorCoordinates;
  v2Radius: SharedValue<number>;
};

export type DirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    componentSettings: Required<CurvedEdgeSettings> & {
      arrow: Required<EdgeArrowSettings>;
      label?: EdgeLabelSettings;
    };
    edge: DirectedEdge<E, V>;
    renderers: DirectedCurvedEdgeRenderers<E>;
  };

export type UndirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    componentSettings: Required<CurvedEdgeSettings> & {
      label?: EdgeLabelSettings;
    };
    edge: UndirectedEdge<E, V>;
    renderers: UndirectedCurvedEdgeRenderers<E>;
  };

export type DirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    componentSettings: Required<StraightEdgeSettings> & {
      arrow: Required<EdgeArrowSettings>;
      label?: EdgeLabelSettings;
    };
    edge: DirectedEdge<E, V>;
    renderers: DirectedStraightEdgeRenderers<E>;
  };

export type UndirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    componentSettings: Required<StraightEdgeSettings> & {
      label?: EdgeLabelSettings;
    };
    edge: UndirectedEdge<E, V>;
    renderers: UndirectedStraightEdgeRenderers<E>;
  };

export type EdgeComponentProps<E, V> = Omit<
  | DirectedCurvedEdgeComponentProps<E, V>
  | DirectedStraightEdgeComponentProps<E, V>
  | UndirectedCurvedEdgeComponentProps<E, V>
  | UndirectedStraightEdgeComponentProps<E, V>,
  'animatedEdgesCount' | 'animatedOrder' | 'animationProgress' | 'renderers'
> & {
  arrowRenderer?: EdgeArrowRenderFunction;
  edgeRenderer: EdgeRenderFunction<E>;
  edgesCount: number;
  labelRenderer?: EdgeLabelRendererFunction<E>;
  onRemove: (key: string) => void;
  order: number;
  removed: boolean;
};

export type EdgeComponentData<
  E,
  V,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  animationSettings: AnimationSettingsWithDefaults;
  arrowRenderer?: EdgeArrowRenderFunction;
  componentSettings: GraphSettingsWithDefaults<V, E, ED>['components']['edge'];
  edge: Edge<E, V>;
  edgeRenderer: EdgeRenderFunction<E>;
  edgesCount: number;
  labelRenderer?: EdgeLabelRendererFunction<E>;
  order: number;
  removed: boolean;
  v1Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Position: AnimatedVectorCoordinates;
  v2Radius: SharedValue<number>;
};

export type EdgeComponentRenderData = {
  labelPosition: AnimatedVectorCoordinates;
};

export type EdgeRenderHandler = (
  key: string,
  renderData: EdgeComponentRenderData
) => void;

export type EdgeRemoveHandler = (key: string) => void;

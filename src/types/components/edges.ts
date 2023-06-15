import { SharedValue } from 'react-native-reanimated';

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
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Radius: SharedValue<number>;
  animationProgress: SharedValue<number>;
  animatedOrder: SharedValue<number>;
  animatedEdgesCount: SharedValue<number>;
  animationSettings: AnimationSettingsWithDefaults;
  onRender: EdgeRenderHandler;
};

export type DirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<E, V>;
    renderers: DirectedCurvedEdgeRenderers<E>;
    componentSettings: Required<CurvedEdgeSettings> & {
      arrow: Required<EdgeArrowSettings>;
      label?: EdgeLabelSettings;
    };
  };

export type UndirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: UndirectedEdge<E, V>;
    renderers: UndirectedCurvedEdgeRenderers<E>;
    componentSettings: Required<CurvedEdgeSettings> & {
      label?: EdgeLabelSettings;
    };
  };

export type DirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<E, V>;
    renderers: DirectedStraightEdgeRenderers<E>;
    componentSettings: Required<StraightEdgeSettings> & {
      arrow: Required<EdgeArrowSettings>;
      label?: EdgeLabelSettings;
    };
  };

export type UndirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: UndirectedEdge<E, V>;
    renderers: UndirectedStraightEdgeRenderers<E>;
    componentSettings: Required<StraightEdgeSettings> & {
      label?: EdgeLabelSettings;
    };
  };

export type EdgeComponentProps<E, V> = Omit<
  | UndirectedCurvedEdgeComponentProps<E, V>
  | DirectedCurvedEdgeComponentProps<E, V>
  | UndirectedStraightEdgeComponentProps<E, V>
  | DirectedStraightEdgeComponentProps<E, V>,
  'animationProgress' | 'animatedOrder' | 'animatedEdgesCount' | 'renderers'
> & {
  order: number;
  edgesCount: number;
  removed: boolean;
  edgeRenderer: EdgeRenderFunction<E>;
  arrowRenderer?: EdgeArrowRenderFunction;
  labelRenderer?: EdgeLabelRendererFunction<E>;
  onRemove: (key: string) => void;
};

export type EdgeComponentData<E, V> = {
  edge: Edge<E, V>;
  removed: boolean;
  order: number;
  edgesCount: number;
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Radius: SharedValue<number>;
  componentSettings: GraphSettingsWithDefaults<V, E>['components']['edge'];
  animationSettings: AnimationSettingsWithDefaults;
  edgeRenderer: EdgeRenderFunction<E>;
  arrowRenderer?: EdgeArrowRenderFunction;
  labelRenderer?: EdgeLabelRendererFunction<E>;
};

export type EdgeComponentRenderData = {
  labelPosition: AnimatedVectorCoordinates;
};

export type EdgeRenderHandler = (
  key: string,
  renderData: EdgeComponentRenderData
) => void;

export type EdgeRemoveHandler = (key: string) => void;

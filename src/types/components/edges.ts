import { SharedValue } from 'react-native-reanimated';

import { DirectedEdge, Edge, UndirectedEdge } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  DirectedStraightEdgeRenderers,
  EdgeArrowRenderFunction,
  EdgeLabelRendererFunction,
  EdgeRenderFunction,
  SharedRenderersProps,
  UndirectedStraightEdgeRenderers
} from '@/types/renderers';
import {
  DirectedCurvedEdgeRenderers,
  UndirectedCurvedEdgeRenderers
} from '@/types/renderers/edges/curved';
import {
  CurvedEdgeSettings,
  EdgeArrowSettings,
  EdgeLabelSettings,
  StraightEdgeSettings
} from '@/types/settings';
import { AnimationSettingsWithDefaults } from '@/types/settings/animations';

type SharedEdgeComponentProps = SharedRenderersProps & {
  animatedEdgesCount: SharedValue<number>;
  animatedOrder: SharedValue<number>;
  animationProgress: SharedValue<number>;
  animationSettings: AnimationSettingsWithDefaults;
  labelHeight: SharedValue<number>;
  labelPosition: AnimatedVectorCoordinates;
  v1Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Position: AnimatedVectorCoordinates;
  v2Radius: SharedValue<number>;
};

export type DirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    componentSettings: {
      arrow: Required<EdgeArrowSettings>;
      edge: Required<CurvedEdgeSettings>;
      label?: EdgeLabelSettings;
    };
    edge: DirectedEdge<E, V>;
    renderers: DirectedCurvedEdgeRenderers<E>;
  };

export type UndirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    componentSettings: {
      edge: Required<CurvedEdgeSettings>;
      label?: EdgeLabelSettings;
    };
    edge: UndirectedEdge<E, V>;
    renderers: UndirectedCurvedEdgeRenderers<E>;
  };

export type DirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    componentSettings: {
      arrow: Required<EdgeArrowSettings>;
      edge: Required<StraightEdgeSettings>;
      label?: EdgeLabelSettings;
    };
    edge: DirectedEdge<E, V>;
    renderers: DirectedStraightEdgeRenderers<E>;
  };

export type UndirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    componentSettings: {
      edge: Required<StraightEdgeSettings>;
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
  'animatedEdgesCount' | 'animatedOrder' | 'renderers'
> & {
  arrowRenderer?: EdgeArrowRenderFunction;
  edgeRenderer: EdgeRenderFunction<E>;
  edgesCount: SharedValue<number>;
  labelRenderer?: EdgeLabelRendererFunction<E>;
  onRemove: (key: string) => void;
  order: SharedValue<number>;
  removed: boolean;
};

export type EdgeComponentData<E, V> = {
  animationProgress: SharedValue<number>;
  animationSettings: AnimationSettingsWithDefaults;
  displayed: SharedValue<boolean>;
  edge: Edge<E, V>;
  edgesCount: SharedValue<number>;
  labelHeight: SharedValue<number>;
  labelPosition: AnimatedVectorCoordinates;
  order: SharedValue<number>;
  removed: boolean;
  v1Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Position: AnimatedVectorCoordinates;
  v2Radius: SharedValue<number>;
};

export type EdgeRemoveHandler = (key: string) => void;

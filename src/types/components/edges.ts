import { SharedValue } from 'react-native-reanimated';

import { AnimationSettingsWithDefaults } from '@/types/animations';
import { DirectedEdge, UndirectedEdge } from '@/types/graphs';
import { AnimatedVector, AnimatedVectorCoordinates } from '@/types/layout';
import {
  DirectedStraightEdgeRenderers,
  EdgeArrowRenderFunction,
  EdgeLabelRendererFunction,
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
  StraightEdgeSettings
} from '@/types/settings';

import { EdgeRenderFunction } from '../../../dist/types/types/renderer/index';

type SharedEdgeComponentProps = {
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  vertexRadius: number;
  animationProgress: SharedValue<number>;
  onLabelRender?: (key: string, position: AnimatedVector) => void;
  animatedOrder: SharedValue<number>;
  animatedEdgesCount: SharedValue<number>;
  animationSettings: AnimationSettingsWithDefaults;
};

export type DirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<E, V>;
    renderers: DirectedCurvedEdgeRenderers<E>;
    settings: Required<CurvedEdgeSettings> & {
      arrow: Required<EdgeArrowSettings>;
      label?: EdgeLabelSettings;
    };
  };

export type UndirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: UndirectedEdge<E, V>;
    renderers: UndirectedCurvedEdgeRenderers<E>;
    settings: Required<CurvedEdgeSettings> & {
      label?: EdgeLabelSettings;
    };
  };

export type DirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<E, V>;
    renderers: DirectedStraightEdgeRenderers<E>;
    settings: Required<StraightEdgeSettings> & {
      arrow: Required<EdgeArrowSettings>;
      label?: EdgeLabelSettings;
    };
  };

export type UndirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: UndirectedEdge<E, V>;
    renderers: UndirectedStraightEdgeRenderers<E>;
    settings: Required<StraightEdgeSettings> & {
      label?: EdgeLabelSettings;
    };
  };

export type EdgeComponentProps<E, V> = Omit<
  | UndirectedCurvedEdgeComponentProps<E, V>
  | DirectedCurvedEdgeComponentProps<E, V>
  | UndirectedStraightEdgeComponentProps<E, V>
  | DirectedStraightEdgeComponentProps<E, V>,
  'animationProgress' | 'renderers'
> & {
  order: number;
  edgesCount: number;
  removed: boolean;
  edgeRenderer: EdgeRenderFunction<E>;
  arrowRenderer?: EdgeArrowRenderFunction;
  labelRenderer?: EdgeLabelRendererFunction<E>;
  onRemove: (key: string) => void;
};

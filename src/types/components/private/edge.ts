/* eslint-disable import/no-unused-modules */
import { SharedValue } from 'react-native-reanimated';

import DirectedEdge from '@/models/edges/DirectedEdge';
import {
  DirectedGraphWithCurvedEdgeRenderers,
  DirectedGraphWithStraightEdgeRenderers
} from '@/types/components/public/renderers';
import { EdgeRemoveHandler } from '@/types/data/private/edge';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { AllAnimationSettings } from '@/types/settings/private/graph/animations';

type SharedEdgeComponentProps = {
  animatedEdgesCount: SharedValue<number>;
  animatedOrder: SharedValue<number>;
  animationProgress: SharedValue<number>;
  animationSettings: AllAnimationSettings;
  labelHeight: SharedValue<number>;
  labelPosition: AnimatedVectorCoordinates;
  v1Position: AnimatedVectorCoordinates;
  v1Radius: SharedValue<number>;
  v2Position: AnimatedVectorCoordinates;
  v2Radius: SharedValue<number>;
};

export type DirectedStraightEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<V, E>;
    renderers: DirectedGraphWithStraightEdgeRenderers<V, E>;
    settings: {
      // TODO
    };
  };

export type DirectedCurvedEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<V, E>;
    renderers: DirectedGraphWithCurvedEdgeRenderers<V, E>;
    settings: {
      // TODO
    };
  };

export type UndirectedStraightEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<V, E>;
    renderers: DirectedGraphWithStraightEdgeRenderers<V, E>;
    settings: {
      // TODO
    };
  };

export type UndirectedCurvedEdgeComponentProps<V, E> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<V, E>;
    renderers: DirectedGraphWithCurvedEdgeRenderers<V, E>;
    settings: {
      // TODO
    };
  };

export type EdgeComponentProps<V, E> = Omit<
  | DirectedCurvedEdgeComponentProps<V, E>
  | DirectedStraightEdgeComponentProps<V, E>
  | UndirectedCurvedEdgeComponentProps<V, E>
  | UndirectedStraightEdgeComponentProps<V, E>,
  'animatedEdgesCount' | 'animatedOrder'
> & {
  onRemove: EdgeRemoveHandler;
  order: SharedValue<number>;
  removed: boolean;
};

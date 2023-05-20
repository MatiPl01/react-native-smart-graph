import { SharedValue } from 'react-native-reanimated';

import { DirectedEdge, UndirectedEdge } from '../graphs';
import { AnimatedVectorCoordinates } from '../layout';
import {
  DirectedStraightEdgeRenderers,
  UndirectedStraightEdgeRenderers
} from '../renderer';
import {
  DirectedCurvedEdgeRenderers,
  UndirectedCurvedEdgeRenderers
} from '../renderer/edges/curved';
import {
  CurvedEdgeSettings,
  EdgeArrowSettings,
  EdgeLabelSettings,
  StraightEdgeSettings
} from '../settings';

type SharedEdgeComponentProps = {
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  vertexRadius: number;
  animationProgress: SharedValue<number>;
  removed: boolean;
  onRemove: (key: string) => void;
};

export type DirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<E, V>;
    edgesBetweenVertices: Array<DirectedEdge<E, V>>;
    renderers: DirectedCurvedEdgeRenderers<E>;
    settings: Required<CurvedEdgeSettings> & {
      arrow: Required<EdgeArrowSettings>;
      label?: EdgeLabelSettings;
    };
  };

export type UndirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: UndirectedEdge<E, V>;
    edgesBetweenVertices: Array<UndirectedEdge<E, V>>;
    renderers: UndirectedCurvedEdgeRenderers<E>;
    settings: Required<CurvedEdgeSettings> & {
      label?: EdgeLabelSettings;
    };
  };

export type DirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<E, V>;
    edgesBetweenVertices: Array<DirectedEdge<E, V>>;
    renderers: DirectedStraightEdgeRenderers<E>;
    settings: Required<StraightEdgeSettings> & {
      arrow: Required<EdgeArrowSettings>;
      label?: EdgeLabelSettings;
    };
  };

export type UndirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: UndirectedEdge<E, V>;
    edgesBetweenVertices: Array<UndirectedEdge<E, V>>;
    renderers: UndirectedStraightEdgeRenderers<E>;
    settings: Required<StraightEdgeSettings> & {
      label?: EdgeLabelSettings;
    };
  };

export type EdgeComponentProps<E, V> =
  | UndirectedCurvedEdgeComponentProps<E, V>
  | DirectedCurvedEdgeComponentProps<E, V>
  | UndirectedStraightEdgeComponentProps<E, V>
  | DirectedStraightEdgeComponentProps<E, V>;

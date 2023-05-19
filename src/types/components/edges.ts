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
import { CurvedEdgeSettings, StraightEdgeSettings } from '../settings';

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
    edgesBetween: Array<DirectedEdge<E, V>>;
    renderers: DirectedCurvedEdgeRenderers<E>;
    settings: CurvedEdgeSettings;
  };

export type UndirectedCurvedEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: UndirectedEdge<E, V>;
    edgesBetween: Array<UndirectedEdge<E, V>>;
    renderers: UndirectedCurvedEdgeRenderers<E>;
    settings: CurvedEdgeSettings;
  };

export type DirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: DirectedEdge<E, V>;
    edgesBetween: Array<DirectedEdge<E, V>>;
    renderers: DirectedStraightEdgeRenderers<E>;
    settings: StraightEdgeSettings;
  };

export type UndirectedStraightEdgeComponentProps<E, V> =
  SharedEdgeComponentProps & {
    edge: UndirectedEdge<E, V>;
    edgesBetween: Array<UndirectedEdge<E, V>>;
    renderers: UndirectedStraightEdgeRenderers<E>;
    settings: StraightEdgeSettings;
  };

export type EdgeComponentProps<E, V> =
  | UndirectedCurvedEdgeComponentProps<E, V>
  | DirectedCurvedEdgeComponentProps<E, V>
  | UndirectedStraightEdgeComponentProps<E, V>
  | DirectedStraightEdgeComponentProps<E, V>;

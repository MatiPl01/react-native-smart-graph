import { Animatable } from '@/types/utils';

/*
 * COMPONENTS SETTINGS
 */
export type VertexSettings = {
  radius?: number;
};

export enum VertexLabelPosition {
  BOTTOM = 'bottom',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  CENTER = 'center',
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right'
}

export type VertexLabelSettings =
  | {
      offset?: Animatable<number>;
      position?: Animatable<Omit<VertexLabelPosition, 'center'>>;
    }
  | {
      position: Animatable<VertexLabelPosition.CENTER>;
    };

export type StraightEdgeSettings = {
  maxOffsetFactor?: Animatable<number>;
};

export type CurvedEdgeSettings = Record<string, never>; // No settings for now

export type EdgeSettings = CurvedEdgeSettings | StraightEdgeSettings;

export type EdgeLabelSettings = {
  scale?: Animatable<number>;
};

export type EdgeArrowSettings = {
  scale?: Animatable<number>;
};

export type EdgeType = 'curved' | 'straight';

/*
 * GRAPH COMPONENTS SETTINGS
 */
type SharedGraphComponentsSettings = {
  edgeLabel?: EdgeLabelSettings;
  vertex?: VertexSettings;
  vertexLabel?: VertexLabelSettings;
};

export type UndirectedGraphWithStraightEdgesComponentsSettings =
  SharedGraphComponentsSettings & {
    edge?: StraightEdgeSettings;
  };

export type UndirectedGraphWithCurvedEdgesComponentsSettings =
  SharedGraphComponentsSettings & {
    edge?: CurvedEdgeSettings;
  };

export type DirectedGraphWithStraightEdgesComponentsSettings =
  UndirectedGraphWithStraightEdgesComponentsSettings & {
    edgeArrow?: EdgeArrowSettings;
  };

export type DirectedGraphWithCurvedEdgesComponentsSettings =
  UndirectedGraphWithCurvedEdgesComponentsSettings & {
    edgeArrow?: EdgeArrowSettings;
  };

export type UndirectedGraphComponentsSettings =
  | UndirectedGraphWithCurvedEdgesComponentsSettings
  | UndirectedGraphWithStraightEdgesComponentsSettings;

export type DirectedGraphComponentsSettings =
  | DirectedGraphWithCurvedEdgesComponentsSettings
  | DirectedGraphWithStraightEdgesComponentsSettings;

export type GraphComponentsSettings =
  | DirectedGraphComponentsSettings
  | UndirectedGraphComponentsSettings;

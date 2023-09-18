import { Sharedifyable } from '@/types/utils';

/*
 * COMPONENTS SETTINGS
 */
export type VertexSettings = {
  radius?: number;
};

export type StraightEdgeSettings = {
  maxOffsetFactor?: Sharedifyable<number>;
};

export type CurvedEdgeSettings = Record<string, never>; // No settings for now

export type EdgeSettings = CurvedEdgeSettings | StraightEdgeSettings;

export type LabelSettings = {
  scale?: Sharedifyable<number>;
};

export type ArrowSettings = {
  scale?: Sharedifyable<number>;
};

export type EdgeType = 'curved' | 'straight';

/*
 * GRAPH COMPONENTS SETTINGS
 */
type SharedGraphComponentsSettings = {
  label?: LabelSettings;
  vertex?: VertexSettings;
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
    arrow?: ArrowSettings;
  };

export type DirectedGraphWithCurvedEdgesComponentsSettings =
  UndirectedGraphWithCurvedEdgesComponentsSettings & {
    arrow?: ArrowSettings;
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

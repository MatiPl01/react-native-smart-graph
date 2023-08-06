/*
 * COMPONENTS SETTINGS
 */
export type VertexSettings = {
  radius?: number;
};

export type StraightEdgeSettings = {
  maxOffsetFactor?: number;
  type: 'straight';
};

export type CurvedEdgeSettings = {
  type: 'curved';
};

export type EdgeSettings = CurvedEdgeSettings | StraightEdgeSettings;

export type LabelSettings = {
  displayed?: boolean;
  scale?: number;
};

export type ArrowSettings = {
  scale?: number;
};

export type EdgeType = EdgeSettings['type'];

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

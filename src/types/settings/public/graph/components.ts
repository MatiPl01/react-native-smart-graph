export type VertexSettings = {
  radius?: number;
};

export type StraightEdgeSettings = {
  maxOffsetFactor?: number; // 0.5 is a good value
  type: 'straight';
};

export type CurvedEdgeSettings = {
  type: 'curved';
};

export type EdgeSettings = CurvedEdgeSettings | StraightEdgeSettings;

export type LabelSettings = {
  scale?: number; // 0.75 is a good value
};

export type ArrowSettings = {
  scale?: number; // scale relative to vertex radius
};

export type EdgeType = EdgeSettings['type'];

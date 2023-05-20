import { DeepRequired } from '../utils';

type SharedVertexSettings = {
  radius?: number;
};

export type VertexSettings = SharedVertexSettings;

export type StraightEdgeSettings = {
  type: 'straight';
  maxOffsetFactor?: number; // 0.5 is a good value
};

export type CurvedEdgeSettings = {
  type: 'curved';
  curveFactor?: number; // 0.5 is a good value
};

type SharedEdgeSettings =
  | Record<string, never>
  | StraightEdgeSettings
  | CurvedEdgeSettings;

export type EdgeArrowSettings = {
  scale?: number; // scale relative to vertex radius
};

export type DirectedEdgeSettings = SharedEdgeSettings & {
  arrow?: EdgeArrowSettings;
};

export type UndirectedEdgeSettings = SharedEdgeSettings;

export type DirectedGraphComponentsSettings = {
  vertex?: VertexSettings;
  edge?: DirectedEdgeSettings;
};

export type UndirectedGraphComponentsSettings = {
  vertex?: VertexSettings;
  edge?: UndirectedEdgeSettings;
};

export type DirectedGraphComponentsSettingsWithDefaults = DeepRequired<
  DirectedGraphComponentsSettings,
  ['vertex', 'radius'] | ['edge', 'type']
>;

export type UndirectedGraphComponentsSettingsWithDefaults = DeepRequired<
  UndirectedGraphComponentsSettings,
  ['vertex', 'radius'] | ['edge', 'type']
>;

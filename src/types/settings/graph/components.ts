import { DeepRequiredAll } from '@/types/utils';

export type VertexSettings = {
  radius?: number;
};

export type VertexSettingsWithDefaults = DeepRequiredAll<VertexSettings>;

export type StraightEdgeSettings = {
  maxOffsetFactor?: number; // 0.5 is a good value
  type: 'straight';
};

export type CurvedEdgeSettings = {
  type: 'curved';
};

export type EdgeLabelSettings = {
  scale?: number; // 0.75 is a good value
};

export type EdgeSettings = CurvedEdgeSettings | StraightEdgeSettings;

export type EdgeSettingsWithDefaults = DeepRequiredAll<EdgeSettings>;

export type EdgeType = EdgeSettings['type'];

export type EdgeArrowSettings = {
  scale?: number; // scale relative to vertex radius
};

type SharedGraphComponentsSettings = {
  edge?: EdgeSettings;
  label?: EdgeLabelSettings;
  vertex?: VertexSettings;
};

export type SharedGraphComponentsSettingsWithDefaults =
  DeepRequiredAll<SharedGraphComponentsSettings>;

export type DirectedGraphComponentsSettings = SharedGraphComponentsSettings & {
  arrow?: EdgeArrowSettings;
};

export type UndirectedGraphComponentsSettings = SharedGraphComponentsSettings;

export type DirectedGraphComponentsSettingsWithDefaults =
  DeepRequiredAll<DirectedGraphComponentsSettings>;

export type UndirectedGraphComponentsSettingsWithDefaults =
  DeepRequiredAll<UndirectedGraphComponentsSettings>;

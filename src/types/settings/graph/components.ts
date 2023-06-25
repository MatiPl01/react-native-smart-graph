import { DeepRequired, DeepRequiredAll } from '@/types/utils';

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
  sizeRatio?: number; // 0.75 is a good value
};

type SharedEdgeSettings = (
  | CurvedEdgeSettings
  | Record<string, never>
  | StraightEdgeSettings
) & {
  label?: EdgeLabelSettings;
};

export type EdgeArrowSettings = {
  scale?: number; // scale relative to vertex radius
};

export type DirectedEdgeSettings = SharedEdgeSettings & {
  arrow?: EdgeArrowSettings;
};

export type UndirectedEdgeSettings = SharedEdgeSettings;

type SharedGraphComponentsSettings = {
  vertex?: VertexSettings;
};

export type DirectedGraphComponentsSettings = SharedGraphComponentsSettings & {
  edge?: DirectedEdgeSettings;
};

export type UndirectedGraphComponentsSettings =
  SharedGraphComponentsSettings & {
    edge?: UndirectedEdgeSettings;
  };

export type DirectedGraphComponentsSettingsWithDefaults = DeepRequired<
  DirectedGraphComponentsSettings,
  ['edge', 'type'] | ['label', 'sizeRatio'] | ['vertex', 'radius']
>;

export type UndirectedGraphComponentsSettingsWithDefaults = DeepRequired<
  UndirectedGraphComponentsSettings,
  ['edge', 'type'] | ['label', 'sizeRatio'] | ['vertex', 'radius']
>;

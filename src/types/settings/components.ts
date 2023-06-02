import { DeepRequired } from '@/types/utils';

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
};

export type EdgeLabelSettings = {
  sizeRatio?: number; // 0.75 is a good value
};

type SharedEdgeSettings = (
  | Record<string, never>
  | StraightEdgeSettings
  | CurvedEdgeSettings
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
  ['vertex', 'radius'] | ['edge', 'type'] | ['label', 'sizeRatio']
>;

export type UndirectedGraphComponentsSettingsWithDefaults = DeepRequired<
  UndirectedGraphComponentsSettings,
  ['vertex', 'radius'] | ['edge', 'type'] | ['label', 'sizeRatio']
>;

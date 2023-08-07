import {
  ArrowSettings,
  CurvedEdgeSettings,
  EdgeSettings,
  LabelSettings,
  StraightEdgeSettings,
  VertexSettings
} from '@/types/settings/public';
import { DeepRequired, DeepSharedify, SharedifyWithout } from '@/types/utils';

/*
 * DEFAULT SETTINGS
 */
export type AllVertexSettings = DeepRequired<VertexSettings>;

export type AllEdgeSettings = DeepRequired<EdgeSettings>;

export type AllStraightEdgeSettings = DeepRequired<StraightEdgeSettings>;

export type AllCurvedEdgeSettings = DeepRequired<CurvedEdgeSettings>;

export type AllArrowSettings = DeepRequired<ArrowSettings>;

export type AllLabelSettings = DeepRequired<LabelSettings>;

export type AllGraphComponentsSettings = {
  arrow?: AllArrowSettings;
  edge: AllEdgeSettings;
  label?: AllLabelSettings;
  vertex: AllVertexSettings;
};

/*
 * INTERNAL SETTINGS
 */
export type InternalStraightEdgeSettings = Pick<
  AllStraightEdgeSettings,
  'type'
> &
  DeepSharedify<Omit<AllStraightEdgeSettings, 'type'>>;

export type InternalCurvedEdgeSettings = Pick<AllCurvedEdgeSettings, 'type'> &
  DeepSharedify<Omit<AllCurvedEdgeSettings, 'type'>>;

export type InternalArrowSettings = DeepSharedify<AllArrowSettings>;

export type InternalLabelSettings = SharedifyWithout<
  AllLabelSettings,
  'displayed'
>;

export type InternalEdgeSettings = Pick<AllEdgeSettings, 'type'> &
  DeepSharedify<Omit<AllEdgeSettings, 'type'>>;

export type InternalUndirectedStraightEdgeSettings = {
  edge: InternalStraightEdgeSettings;
  label?: InternalLabelSettings;
};

export type InternalUndirectedCurvedEdgeSettings = {
  edge: InternalCurvedEdgeSettings;
  label?: InternalLabelSettings;
};

export type InternalDirectedStraightEdgeSettings =
  InternalUndirectedStraightEdgeSettings & {
    arrow: InternalArrowSettings;
  };

export type InternalDirectedCurvedEdgeSettings =
  InternalUndirectedCurvedEdgeSettings & {
    arrow: InternalArrowSettings;
  };

export type InternalVertexSettings = DeepSharedify<AllVertexSettings>;

/*
 * INTERNAL GRAPH COMPONENTS SETTINGS
 */
export type InternalGraphComponentsSettings = {
  arrow?: InternalArrowSettings;
  edge: InternalEdgeSettings;
  label?: InternalLabelSettings;
  vertex: InternalVertexSettings;
};

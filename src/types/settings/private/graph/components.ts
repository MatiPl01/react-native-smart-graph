import {
  ArrowSettings,
  CurvedEdgeSettings,
  EdgeSettings,
  LabelSettings,
  StraightEdgeSettings,
  VertexSettings
} from '@/types/settings/public';
import { DeepRequired, DeepSharedify } from '@/types/utils';

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
export type InternalStraightEdgeSettings =
  DeepSharedify<AllStraightEdgeSettings>;

export type InternalCurvedEdgeSettings = Pick<AllCurvedEdgeSettings, 'type'> &
  DeepSharedify<Omit<AllCurvedEdgeSettings, 'type'>>;

export type InternalArrowSettings = DeepSharedify<AllArrowSettings>;

export type InternalLabelSettings = DeepSharedify<AllLabelSettings>;

export type InternalEdgeSettings = DeepSharedify<AllEdgeSettings>;

type SharedInternalEdgeSettings = {
  vertex: InternalVertexSettings;
};

export type InternalUndirectedStraightEdgeSettings =
  SharedInternalEdgeSettings & {
    edge: InternalStraightEdgeSettings;
    label: InternalLabelSettings;
  };

export type InternalUndirectedCurvedEdgeSettings =
  SharedInternalEdgeSettings & {
    edge: InternalCurvedEdgeSettings;
    label: InternalLabelSettings;
  };

export type InternalDirectedStraightEdgeSettings =
  InternalUndirectedStraightEdgeSettings & {
    arrow: InternalArrowSettings;
  };

export type InternalDirectedCurvedEdgeSettings =
  InternalUndirectedCurvedEdgeSettings & {
    arrow: InternalArrowSettings;
  };

export type InternalVertexSettings = AllVertexSettings;

/*
 * INTERNAL GRAPH COMPONENTS SETTINGS
 */
export type InternalGraphComponentsSettings = {
  arrow?: InternalArrowSettings;
  edge: InternalEdgeSettings;
  label?: InternalLabelSettings;
  vertex: InternalVertexSettings;
};

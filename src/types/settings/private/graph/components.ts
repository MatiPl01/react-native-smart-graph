import {
  CurvedEdgeSettings,
  EdgeArrowSettings,
  EdgeLabelSettings,
  EdgeSettings,
  StraightEdgeSettings,
  VertexLabelPosition,
  VertexSettings
} from '@/types/settings/public';
import { Animatable, DeepRequired, DeepSharedify } from '@/types/utils';

/*
 * DEFAULT SETTINGS
 */
export type AllVertexSettings = DeepRequired<VertexSettings>;

export type AllVertexLabelSettings = {
  offset: Animatable<number>;
  position: Animatable<VertexLabelPosition>;
};

export type AllEdgeSettings = DeepRequired<EdgeSettings>;

export type AllStraightEdgeSettings = DeepRequired<StraightEdgeSettings>;

export type AllCurvedEdgeSettings = DeepRequired<CurvedEdgeSettings>;

export type AllEdgeArrowSettings = DeepRequired<EdgeArrowSettings>;

export type AllEdgeLabelSettings = DeepRequired<EdgeLabelSettings>;

export type AllGraphComponentsSettings = {
  edge: AllEdgeSettings;
  edgeArrow?: AllEdgeArrowSettings;
  edgeLabel?: AllEdgeLabelSettings;
  vertex: AllVertexSettings;
  vertexLabel?: AllVertexLabelSettings;
};

/*
 * INTERNAL SETTINGS
 */
export type InternalVertexLabelSettings = DeepSharedify<AllVertexLabelSettings>;

export type InternalStraightEdgeSettings =
  DeepSharedify<AllStraightEdgeSettings>;

export type InternalCurvedEdgeSettings = Pick<AllCurvedEdgeSettings, 'type'> &
  DeepSharedify<Omit<AllCurvedEdgeSettings, 'type'>>;

export type InternalEdgeArrowSettings = DeepSharedify<AllEdgeArrowSettings>;

export type InternalEdgeLabelSettings = DeepSharedify<AllEdgeLabelSettings>;

export type InternalEdgeSettings = DeepSharedify<AllEdgeSettings>;

type SharedInternalEdgeSettings = {
  vertex: InternalVertexSettings;
};

export type InternalUndirectedStraightEdgeSettings =
  SharedInternalEdgeSettings & {
    edge: InternalStraightEdgeSettings;
    label: InternalEdgeLabelSettings;
  };

export type InternalUndirectedCurvedEdgeSettings =
  SharedInternalEdgeSettings & {
    edge: InternalCurvedEdgeSettings;
    label: InternalEdgeLabelSettings;
  };

export type InternalDirectedStraightEdgeSettings =
  InternalUndirectedStraightEdgeSettings & {
    arrow: InternalEdgeArrowSettings;
  };

export type InternalDirectedCurvedEdgeSettings =
  InternalUndirectedCurvedEdgeSettings & {
    arrow: InternalEdgeArrowSettings;
  };

export type InternalVertexSettings = AllVertexSettings;

/*
 * INTERNAL GRAPH COMPONENTS SETTINGS
 */
export type InternalGraphComponentsSettings = {
  edge: InternalEdgeSettings;
  edgeArrow?: InternalEdgeArrowSettings;
  edgeLabel?: InternalEdgeLabelSettings;
  vertex: InternalVertexSettings;
  vertexLabel?: InternalVertexLabelSettings;
};

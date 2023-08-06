import {
  ArrowSettings,
  CurvedEdgeSettings,
  EdgeSettings,
  LabelSettings,
  StraightEdgeSettings,
  VertexSettings
} from '@/types/settings/public';
import { DeepRequire, DeepSharedify } from '@/types/utils';

/*
 * DEFAULT SETTINGS
 */
type AllVertexSettings = DeepRequire<VertexSettings>;

export type AllEdgeSettings = DeepRequire<EdgeSettings>;

export type AllStraightEdgeSettings = DeepRequire<StraightEdgeSettings>;

export type AllCurvedEdgeSettings = DeepRequire<CurvedEdgeSettings>;

export type AllArrowSettings = DeepRequire<ArrowSettings>;

export type AllLabelSettings = DeepRequire<LabelSettings>;

export type AllUndirectedGraphComponentsSettings = {
  edge: AllEdgeSettings;
  label: AllLabelSettings;
  vertex: VertexSettings;
};

export type AllDirectedGraphComponentsSettings =
  AllUndirectedGraphComponentsSettings & {
    arrow: AllArrowSettings;
  };

/*
 * INTERNAL SETTINGS
 */
type InternalStraightEdgeSettings = Pick<AllStraightEdgeSettings, 'type'> &
  DeepSharedify<Omit<AllStraightEdgeSettings, 'type'>>;

type InternalCurvedEdgeSettings = Pick<AllCurvedEdgeSettings, 'type'> &
  DeepSharedify<Omit<AllCurvedEdgeSettings, 'type'>>;

type InternalArrowSettings = DeepSharedify<AllArrowSettings>;

type InternalLabelSettings = DeepSharedify<AllLabelSettings>;

export type InternalUndirectedStraightEdgeSettings = {
  edge: InternalStraightEdgeSettings;
  label: InternalLabelSettings;
};

export type InternalUndirectedCurvedEdgeSettings = {
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

export type InternalDirectedEdgeSettings =
  | InternalDirectedCurvedEdgeSettings
  | InternalDirectedStraightEdgeSettings;

export type InternalUndirectedEdgeSettings =
  | InternalUndirectedCurvedEdgeSettings
  | InternalUndirectedStraightEdgeSettings;

export type InternalVertexSettings = DeepSharedify<AllVertexSettings>;

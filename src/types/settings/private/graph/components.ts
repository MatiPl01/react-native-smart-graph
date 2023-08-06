import {
  ArrowSettings,
  CurvedEdgeSettings,
  EdgeSettings,
  LabelSettings,
  StraightEdgeSettings,
  VertexSettings
} from '@/types/settings/public';
import { DeepRequiredAll, Sharedify } from '@/types/utils';

/*
 * DEFAULT SETTINGS
 */
type AllVertexSettings = DeepRequiredAll<VertexSettings>;

export type AllEdgeSettings = DeepRequiredAll<EdgeSettings>;

export type AllStraightEdgeSettings = DeepRequiredAll<StraightEdgeSettings>;

export type AllCurvedEdgeSettings = DeepRequiredAll<CurvedEdgeSettings>;

export type AllArrowSettings = DeepRequiredAll<ArrowSettings>;

export type AllLabelSettings = DeepRequiredAll<LabelSettings>;

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
  Sharedify<Omit<AllStraightEdgeSettings, 'type'>>;

type InternalCurvedEdgeSettings = Pick<AllCurvedEdgeSettings, 'type'> &
  Sharedify<Omit<AllCurvedEdgeSettings, 'type'>>;

type InternalArrowSettings = Sharedify<AllArrowSettings>;

type InternalLabelSettings = Sharedify<AllLabelSettings>;

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

export type InternalVertexSettings = Sharedify<AllVertexSettings>;

import {
  CurvedEdgeSettings,
  EdgeArrowSettings,
  EdgeLabelSettings,
  StraightEdgeSettings,
  VertexSettings
} from '@/types/settings';
import { DeepRequiredAll } from '@/types/utils';

export const VERTEX_COMPONENT_SETTINGS: Required<VertexSettings> = {
  radius: 20
};

export const STRAIGHT_EDGE_COMPONENT_SETTINGS: Required<StraightEdgeSettings> =
  {
    type: 'straight',
    maxOffsetFactor: 0.5
  };

export const CURVED_EDGE_COMPONENT_SETTINGS: Required<CurvedEdgeSettings> = {
  type: 'curved',
  curveFactor: 0.5
};

export const ARROW_COMPONENT_SETTINGS: Required<EdgeArrowSettings> = {
  scale: 0.5
};

export const LABEL_COMPONENT_SETTINGS: DeepRequiredAll<EdgeLabelSettings> = {
  sizeRatio: 0.75
};

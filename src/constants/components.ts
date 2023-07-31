import {
  CurvedEdgeSettings,
  EdgeArrowSettings,
  EdgeLabelSettings,
  StraightEdgeSettings,
  VertexSettings
} from '@/types/settings';

export const VERTEX_COMPONENT_SETTINGS: Required<VertexSettings> = {
  radius: 20
};

export const STRAIGHT_EDGE_COMPONENT_SETTINGS: Required<StraightEdgeSettings> =
  {
    maxOffsetFactor: 0.5,
    type: 'straight'
  };

export const CURVED_EDGE_COMPONENT_SETTINGS: Required<CurvedEdgeSettings> = {
  type: 'curved'
};

export const ARROW_COMPONENT_SETTINGS: Required<EdgeArrowSettings> = {
  scale: 0.5
};

export const LABEL_COMPONENT_SETTINGS: Required<EdgeLabelSettings> = {
  scale: 0.75
};

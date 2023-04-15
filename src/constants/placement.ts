import { OrbitsLayerSizing, RandomLayoutType } from '@/types/settings';

export const SHARED_PLACEMENT_SETTINGS = {
  minVertexSpacing: 20
};

export const RANDOM_PLACEMENT_SETTING = {
  layoutType: 'honeycomb' as RandomLayoutType,
  density: 0.5
};

export const ORBITS_PLACEMENT_SETTING = {
  layerSizes: 'auto' as OrbitsLayerSizing
};

import { OrbitsLayerSizing, RandomLayoutType } from '@/types/placement';

export const SHARED = {
  vertexRadius: 20,
  minVertexSpacing: 20
};

export const RANDOM_PLACEMENT = {
  layoutType: 'honeycomb' as RandomLayoutType,
  density: 0.5
};

export const ORBITS_PLACEMENT = {
  layerSizes: 'auto' as OrbitsLayerSizing
};

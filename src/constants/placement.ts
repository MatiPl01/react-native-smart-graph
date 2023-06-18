import { RandomLayoutType } from '@/types/settings';

export const SHARED_PLACEMENT_SETTINGS = {
  minVertexSpacing: 20
};

export const RANDOM_PLACEMENT_SETTING = {
  density: 0.5,
  layoutType: 'triangles' as RandomLayoutType,
  strategy: 'random'
};

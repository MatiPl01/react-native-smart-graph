import { RandomLayoutType } from '@/types/settings';

export const SHARED_PLACEMENT_SETTINGS = {
  minVertexSpacing: 20
};

export const RANDOM_PLACEMENT_SETTING = {
  strategy: 'random',
  layoutType: 'triangles' as RandomLayoutType,
  density: 0.5
};

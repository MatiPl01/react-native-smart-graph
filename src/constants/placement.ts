import { UnboundRandomPlacementSettingsWithDefaults } from '@/types/settings';

export const SHARED_PLACEMENT_SETTINGS = {
  minVertexSpacing: 20
};

export const RANDOM_PLACEMENT_SETTINGS: UnboundRandomPlacementSettingsWithDefaults =
  {
    density: 0.5,
    layoutType: 'triangles',
    minVertexSpacing: 100
  };

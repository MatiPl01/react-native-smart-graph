import { UnboundRandomPlacementSettingsWithDefaults } from '@/types/settings';

export const SHARED_PLACEMENT_SETTINGS = {
  minVertexSpacing: 20
};

export const RANDOM_PLACEMENT_SETTINGS: UnboundRandomPlacementSettingsWithDefaults =
  {
    density: 0.5,
    layoutType: 'triangular',
    minVertexSpacing: 100
  };

export const DEFAULT_ORBITS_MAX_SECTOR_ANGLE = Math.PI;

import { RandomPlacementSettings } from '@/types/settings';
import { DeepRequiredAll } from '@/types/utils';

export const SHARED_PLACEMENT_SETTINGS = {
  minVertexSpacing: 20
};

export const DEFAULT_RANDOM_GRID_PLACEMENT_SETTINGS: DeepRequiredAll<RandomPlacementSettings> =
  {
    density: 0.5,
    mesh: 'triangular',
    minVertexSpacing: 100,
    strategy: 'random'
  };

export const DEFAULT_ORBITS_MAX_SECTOR_ANGLE = (2 / 3) * Math.PI;

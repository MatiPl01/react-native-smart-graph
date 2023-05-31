import { merge } from 'lodash-es';

import { DEFAULT_FORCES_SETTINGS } from '@/constants/settings';
import { GraphConnections } from '@/types/graphs';
import { VerticesPositions } from '@/types/layout';
import {
  ForcesScale,
  ForcesSettings,
  ForcesSettingsWithDefaults
} from '@/types/settings/forces';

import applyDefaultForces from './strategies/default.forces';

export const createForcesSettings = (
  settings?: ForcesSettings
): ForcesSettingsWithDefaults => {
  switch (settings?.strategy) {
    case 'default':
    default:
      return merge({}, DEFAULT_FORCES_SETTINGS, settings);
  }
};

export const applyForces = (
  connections: GraphConnections,
  verticesPositions: VerticesPositions,
  vertexRadius: number,
  forcesScale: ForcesScale,
  settings: ForcesSettingsWithDefaults
): void => {
  'worklet';
  switch (settings.strategy) {
    case 'default':
    default:
      applyDefaultForces(
        connections,
        verticesPositions,
        vertexRadius,
        forcesScale,
        settings
      );
      break;
  }
};

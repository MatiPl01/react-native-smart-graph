import { GraphConnections } from '@/types/graphs';
import { VerticesPositions } from '@/types/layout';
import {
  DefaultForcesStrategySettingsWithDefaults,
  ForcesScale
} from '@/types/settings/forces';
import { calcForces, updateVerticesPositions } from '@/utils/forces/shared';

const createAttractionFactorGetter = (
  attractionForceFactor: number,
  attractionScale: number,
  vertexRadius: number
) => {
  'worklet';
  return (distance: number) => {
    'worklet';
    return (
      (distance < 2 * vertexRadius
        ? Math.sqrt((0.5 * distance) / vertexRadius)
        : 1) *
      attractionForceFactor *
      Math.log(Math.max(distance, vertexRadius) / attractionScale)
    );
  };
};

const createRepellingFactorGetter = (repulsionScale: number) => {
  'worklet';
  return (distance: number) => {
    'worklet';
    return -repulsionScale / Math.max(distance, 1) ** 2;
  };
};

export default function applyDefaultForces(
  connections: GraphConnections,
  verticesPositions: VerticesPositions,
  vertexRadius: number,
  forcesScale: ForcesScale,
  settings: DefaultForcesStrategySettingsWithDefaults
): void {
  'worklet';
  const {
    forces: {
      attraction: { targetPositions, edges },
      repelling: { vertices }
    }
  } = settings;

  const forces = calcForces(
    connections,
    verticesPositions,
    forcesScale,
    createRepellingFactorGetter(vertices.scale),
    createAttractionFactorGetter(edges.factor, edges.scale, vertexRadius),
    createAttractionFactorGetter(
      targetPositions.factor,
      targetPositions.scale,
      vertexRadius
    )
  );
  updateVerticesPositions(forces, verticesPositions);
}

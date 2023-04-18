import { GraphConnections } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
import ForceManager from '@/utils/forces/ForceManager';

export default class DefaultForceManager extends ForceManager {
  private readonly attractionForceFactor: number;
  private readonly attractionScale: number;
  private readonly repulsionScale: number;

  constructor(
    connections: GraphConnections,
    verticesPositions: Record<string, AnimatedPositionCoordinates>,
    config?: {
      attractionForceFactor?: number;
      attractionScale?: number;
      repulsionScale?: number;
    }
  ) {
    super(connections, verticesPositions);
    this.attractionForceFactor = config?.attractionForceFactor ?? 1;
    this.attractionScale = config?.attractionScale ?? 1;
    this.repulsionScale = config?.repulsionScale ?? 1;
  }

  protected getAttractionFactor(distance: number): number {
    return (
      this.attractionForceFactor * Math.log(distance / this.attractionScale)
    );
  }

  protected getRepellingFactor(distance: number): number {
    return -this.repulsionScale / distance ** 2;
  }
}

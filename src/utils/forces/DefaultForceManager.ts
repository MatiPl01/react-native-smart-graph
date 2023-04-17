import { Graph } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
import ForceManager from '@/utils/forces/ForceManager';

export default class DefaultForceManager<V, E> extends ForceManager<V, E> {
  private readonly attractionForceFactor: number;
  private readonly attractionScale: number;
  private readonly repulsionScale: number;

  constructor(
    graphModel: Graph<V, E>,
    verticesPositions: Record<string, AnimatedPositionCoordinates>,
    config?: {
      attractionForceFactor?: number;
      attractionScale?: number;
      repulsionScale?: number;
    }
  ) {
    super(graphModel, verticesPositions);
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

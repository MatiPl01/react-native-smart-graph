import { Vector } from '@shopify/react-native-skia';

import { ForceManager as IForceManager } from '@/types/forces';
import { GraphConnections } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
import {
  addVectors,
  animatedVectorToVector,
  calcUnitVector,
  distanceBetweenVectors,
  multiplyVector
} from '@/utils/vectors';

export default abstract class ForceManager implements IForceManager {
  private readonly forces: Record<string, Vector> = {};
  private readonly verticesPositions: Record<
    string,
    AnimatedPositionCoordinates
  >;
  private readonly connections: GraphConnections;

  protected constructor(
    connections: GraphConnections,
    verticesPositions: Record<string, AnimatedPositionCoordinates>
  ) {
    this.verticesPositions = verticesPositions;
    this.connections = connections;
  }

  protected abstract getAttractionFactor(distance: number): number;
  protected abstract getRepellingFactor(distance: number): number;

  private updateForces(): void {
    for (const fromVertexKey in this.verticesPositions) {
      const attractiveForce = this.calcResultantAttractiveForce(fromVertexKey);
      // const repellingForce = this.calcResultantRepellingForce(fromVertexKey);
      // this.forces[fromVertexKey] = addVectors(attractiveForce, repellingForce);
    }
  }

  private applyForces(): void {
    Object.entries(this.verticesPositions).forEach(
      ([vertexKey, vertexPosition]) => {
        const force = this.forces[vertexKey] as Vector;
        vertexPosition.x.value += force.x;
        vertexPosition.y.value += force.y;
      }
    );
  }

  private calcResultantAttractiveForce(vertexKey: string): Vector {
    const vertex = this.graphModel.vertex(vertexKey);
    return addVectors(
      ...vertex.neighbors.map(({ key: neighbourKey }) =>
        this.calcAttractiveForce(
          animatedVectorToVector(
            this.verticesPositions[vertexKey] as AnimatedPositionCoordinates
          ),
          animatedVectorToVector(
            this.verticesPositions[neighbourKey] as AnimatedPositionCoordinates
          )
        )
      )
    );
  }

  private calcResultantRepellingForce(vertexKey: string): Vector {
    const vertex = this.graphModel.vertex(vertexKey);
    return addVectors(
      ...vertex.neighbors.map(({ key: neighbourKey }) =>
        this.calcRepellingForce(
          animatedVectorToVector(
            this.verticesPositions[vertexKey] as AnimatedPositionCoordinates
          ),
          animatedVectorToVector(
            this.verticesPositions[neighbourKey] as AnimatedPositionCoordinates
          )
        )
      )
    );
  }

  private calcAttractiveForce(from: Vector, to: Vector): Vector {
    const distance = distanceBetweenVectors(from, to);
    const directionVector = calcUnitVector(from, to);
    const factor = this.getAttractionFactor(distance);

    return multiplyVector(directionVector, factor);
  }

  private calcRepellingForce(from: Vector, to: Vector): Vector {
    const distance = distanceBetweenVectors(from, to);
    const directionVector = calcUnitVector(from, to);
    const factor = this.getRepellingFactor(distance);

    return multiplyVector(directionVector, factor);
  }

  update() {
    console.log('update');

    // this.updateForces();
    // this.applyForces();
  }
}

import { Vertex } from '../graphs';

export type PlacementStrategy = 'random' | 'circular' | 'orbits' | 'tree';

export type PlacementSettings<V, E> =
  | RandomPlacementSettings
  | CircularPlacementSettings<V, E>
  | OrbitsPlacementSettings
  | TreePlacementSettings<V, E>;

type SharedPlacementSettings = {
  vertexRadius?: number;
  minVertexDistance?: number;
};

export type RandomPlacementSettings = SharedPlacementSettings & {
  strategy: 'random';
};

export type OrbitsPlacementSettings = SharedPlacementSettings & {
  strategy: 'orbits';
};

export type CircularPlacementSettings<V, E> = SharedPlacementSettings & {
  strategy: 'circular';
  sortVertices?: boolean;
  sortComparator?: (u: Vertex<V, E>, v: Vertex<V, E>) => number;
};

export type TreePlacementSettings<V, E> = SharedPlacementSettings & {
  strategy: 'tree';
  sortChildren?: boolean; // TODO
  sortComparator?: (u: Vertex<V, E>, v: Vertex<V, E>) => number;
};

export type PlacedVerticesPositions = Record<string, { x: number; y: number }>;

export type GraphLayout = {
  width: number;
  height: number;
  verticesPositions: PlacedVerticesPositions;
};

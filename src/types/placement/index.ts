import { Graph, Vertex } from '../graphs';

export type PlacementStrategy = 'random' | 'circular' | 'orbits' | 'tree';

export type PlacementSettings<V, E> =
  | {
      strategy: Omit<PlacementStrategy, 'circular' | 'tree'>;
    }
  | ({
      strategy: 'circular';
    } & CircularPlacementSettings<V, E>)
  | ({ strategy: 'tree' } & TreePlacementSettings<V, E>);

export type CircularPlacementSettings<V, E> = {
  sortVertices?: boolean;
  sortComparator?: (u: Vertex<V, E>, v: Vertex<V, E>) => number;
};

export type TreePlacementSettings<V, E> = {
  sortChildren?: boolean;
  sortComparator?: (u: Vertex<V, E>, v: Vertex<V, E>) => number;
};

export type PlacedVerticesPositions = Record<string, { x: number; y: number }>;

export type PlacementProps<V, E> = {
  graph: Graph<V, E>;
  containerWidth: number;
  containerHeight: number;
  vertexRadius: number;
};

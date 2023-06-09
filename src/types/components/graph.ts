import { Vector } from '@shopify/react-native-skia';

import {
  AnimationSettingsWithDefaults,
  AnimationsSettings
} from '@/types/animations';
import { Edge, GraphConnections, OrderedEdges, Vertex } from '@/types/graphs';
import { GraphLayout } from '@/types/settings';
import { GraphAnimationsSettingsWithDefaults } from '@/types/settings/animations';

export type GraphVertexData<V, E> = {
  vertex: Vertex<V, E>;
  targetPlacementPosition: Vector;
  animationSettings: AnimationSettingsWithDefaults;
  removed: boolean;
};

export type GraphEdgeData<E, V> = {
  edge: Edge<E, V>;
  order: number;
  edgesCount: number;
  animationSettings: AnimationSettingsWithDefaults;
  removed: boolean;
};

export type GraphData<V, E> = {
  vertices: Array<Vertex<V, E>>;
  edges: Array<Edge<E, V>>;
  orderedEdges: OrderedEdges<E, V>;
  connections: GraphConnections;
  layout: GraphLayout;
  animations: AnimationsSettings;
  defaultAnimations: GraphAnimationsSettingsWithDefaults;
};

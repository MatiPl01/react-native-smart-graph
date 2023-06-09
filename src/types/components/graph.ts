import { Vector } from '@shopify/react-native-skia';

import { Edge, OrderedEdges, Vertex } from '@/types/graphs';
import { GraphLayout } from '@/types/settings';
import {
  AnimationSettingsWithDefaults,
  AnimationsSettings
} from '@/types/settings/animations';
import { GraphAnimationsSettingsWithDefaults } from '@/types/settings/graph/animations';

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
  layout: GraphLayout;
  animations: AnimationsSettings;
  defaultAnimations: GraphAnimationsSettingsWithDefaults;
};

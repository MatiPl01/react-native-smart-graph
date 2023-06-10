import { Edge, OrderedEdges, Vertex } from '@/types/graphs';
import { GraphLayout } from '@/types/settings';
import { AnimationsSettings } from '@/types/settings/animations';
import { GraphAnimationsSettingsWithDefaults } from '@/types/settings/graph/animations';

export type GraphData<V, E> = {
  vertices: Array<Vertex<V, E>>;
  edges: Array<Edge<E, V>>;
  orderedEdges: OrderedEdges<E, V>;
  layout: GraphLayout;
  animations: AnimationsSettings;
  defaultAnimations: GraphAnimationsSettingsWithDefaults;
};

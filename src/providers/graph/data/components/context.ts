import { Context, createContext } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { BoundingRect } from '@/types/layout';
import {
  EdgeComponentData,
  EdgeRemoveHandler,
  VertexComponentData,
  VertexRemoveHandler
} from '@/types/components';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';
import { GraphConnections } from '@/types/graphs';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { withMemoContext } from '@/utils/contexts';

export type GraphComponentsContextType<V, E> = {
  connections: GraphConnections;
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
  edgesData: Record<string, EdgeComponentData<V, E>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleVertexRemove: VertexRemoveHandler;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  targetBoundingRect: SharedValue<BoundingRect>;
  verticesData: Record<string, VertexComponentData<V, E>>;
};

export const GraphComponentsContext = createContext(null as unknown as object);

export const withComponentsData = <
  V,
  E,
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: GraphComponentsContextType<V, E>) => R
) =>
  withMemoContext(
    Component,
    GraphComponentsContext as unknown as Context<
      GraphComponentsContextType<V, E>
    >,
    selector
  );

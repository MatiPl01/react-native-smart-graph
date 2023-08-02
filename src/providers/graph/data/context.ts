import { DataProviderReturnType } from '@/types/data';
import { Graph } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import {
  GraphAnimationsSettingsWithDefaults,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { Sharedify } from '@/types/utils';
import { withMemoContext } from '@/utils/contexts';
import { Context, createContext } from 'react';
import { SharedValue } from 'react-native-reanimated';

export type GraphDataContextType<V, E> = {
  graph: Graph<V, E>;
  renderers: GraphRenderers<V, E>;
  targetBoundingRect: SharedValue<BoundingRect>;
  settings: {
    animations: GraphAnimationsSettingsWithDefaults;
  } & Sharedify<
    Pick<GraphSettingsWithDefaults<V>, 'components' | 'layout' | 'placement'>
  >;
};

export const GraphDataContext = createContext(null as unknown as object);

export const withGraphData = <
  V,
  E,
  C extends GraphDataContextType<V, E>, // context type
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: C) => R
) =>
  withMemoContext(
    Component,
    GraphDataContext as unknown as Context<C>,
    selector
  ) as DataProviderReturnType<P, R>;

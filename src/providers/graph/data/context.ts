import { DataProviderReturnType } from '@/types/data';
import { Graph } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import { GraphRenderers } from '@/types/renderer';
import {
  FocusPoints,
  GraphAnimationsSettingsWithDefaults,
  GraphLayoutSettings,
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
    events: GraphSettingsWithDefaults<V>['events'];
    animations: GraphAnimationsSettingsWithDefaults;
    focus?: {
      disableGestures?: SharedValue<boolean>;
      points: SharedValue<FocusPoints>;
      progress: SharedValue<number>;
    };
    layout: Sharedify<
      Omit<GraphSettingsWithDefaults<V>['layout'], 'managedBy'>
    > & {
      managedBy: GraphLayoutSettings['managedBy'];
    };
  } & Sharedify<Pick<GraphSettingsWithDefaults<V>, 'components' | 'placement'>>;
};

export const GraphDataContext = createContext(null as unknown as object);

export const withGraphData = <
  V,
  E,
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: GraphDataContextType<V, E>) => R
) => Component as DataProviderReturnType<P, R>; // TODO - this is temporary
// withMemoContext(
//   Component,
//   GraphDataContext as unknown as Context<C>,
//   selector
// ) as DataProviderReturnType<P, R>;

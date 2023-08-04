import { Context, createContext } from 'react';
import { SharedValue } from 'react-native-reanimated';

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

export type GraphDataContextType<V, E> = {
  graph: Graph<V, E>;
  renderers: GraphRenderers<V, E>;
  settings: {
    animations: GraphAnimationsSettingsWithDefaults;
    events?: GraphSettingsWithDefaults<V>['events'];
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
  targetBoundingRect: SharedValue<BoundingRect>;
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
) =>
  withMemoContext(
    Component,
    GraphDataContext as unknown as Context<GraphDataContextType<V, E>>,
    selector
  ) as DataProviderReturnType<P, R>;

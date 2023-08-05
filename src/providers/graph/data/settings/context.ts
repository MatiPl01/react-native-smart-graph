import { Context, createContext } from 'react';

import { DataProviderReturnType } from '@/types/data';
import { Graph } from '@/types/graphs';
import { GraphRenderersWithDefaults } from '@/types/renderers';
import {
  GraphAnimationsSettingsWithDefaults,
  GraphSettingsWithDefaults,
  LayoutType
} from '@/types/settings';
import { Sharedify } from '@/types/utils';
import { withMemoContext } from '@/utils/contexts';

export type GraphSettingsContextType<V, E> = {
  graph: Graph<V, E>;
  renderers: GraphRenderersWithDefaults<V, E>;
  settings: {
    animations: GraphAnimationsSettingsWithDefaults;
    events?: GraphSettingsWithDefaults<V>['events'];
    layout: Sharedify<Omit<GraphSettingsWithDefaults<V>['layout'], 'type'>> & {
      type: LayoutType;
    };
  } & Sharedify<Pick<GraphSettingsWithDefaults<V>, 'components' | 'placement'>>;
};

export const GraphSettingsContext = createContext(null as unknown as object);

export const withGraphSettings = <
  V,
  E,
  P extends object, // component props
  R extends Partial<P> // values returned by selector
>(
  Component: React.ComponentType<P>,
  selector: (contextValue: GraphSettingsContextType<V, E>) => R
) =>
  withMemoContext(
    Component,
    GraphSettingsContext as unknown as Context<GraphSettingsContextType<V, E>>,
    selector
  ) as DataProviderReturnType<P, R>;

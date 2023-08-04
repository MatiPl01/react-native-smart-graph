import { makeMutable } from 'react-native-reanimated';

import {
  DirectedGraphComponentProps,
  UndirectedGraphComponentProps
} from '@/components/graphs';
import DefaultEdgeArrowRenderer from '@/components/graphs/arrows/renderers/DefaultEdgeArrowRenderer';
import DefaultCurvedEdgeRenderer from '@/components/graphs/edges/curved/renderers/DefaultCurvedEdgeRenderer';
// TODO - simplify imports
import DefaultStraightEdgeRenderer from '@/components/graphs/edges/straight/renderers/DefaultStraightEdgeRenderer';
import DefaultVertexRenderer from '@/components/graphs/vertices/renderers/DefaultVertexRenderer';
import {
  DEFAULT_ANIMATION_SETTINGS,
  DEFAULT_FORCES_LAYOUT_ANIMATION_SETTINGS
} from '@/constants/animations';
import { DEFAULT_FORCES_STRATEGY_SETTINGS } from '@/constants/forces';
import {
  DirectedGraphRenderers,
  GraphRenderersWithDefaults
} from '@/types/renderer';
import { GraphLayoutSettings } from '@/types/settings';

import { GraphDataContextType } from './context';

export type GraphData<V, E> =
  | DirectedGraphComponentProps<V, E>
  | UndirectedGraphComponentProps<V, E>;

export const createContextValue = <V, E>({
  graph,
  renderers,
  settings
}: GraphData<V, E>): GraphDataContextType<V, E> => {
  const updatedRenderers: GraphRenderersWithDefaults<V, E> = {
    edge:
      renderers?.edge ??
      (settings?.components?.edge?.type === 'curved'
        ? DefaultCurvedEdgeRenderer
        : DefaultStraightEdgeRenderer),
    label: renderers?.label,
    vertex: renderers?.vertex ?? DefaultVertexRenderer
  };

  if (graph.isDirected()) {
    updatedRenderers.arrow =
      (renderers as DirectedGraphRenderers<V, E>)?.arrow ??
      DefaultEdgeArrowRenderer;
  }

  return {
    graph,
    renderers: updatedRenderers,
    settings: {
      animations: {
        edges: {
          ...DEFAULT_ANIMATION_SETTINGS,
          ...settings?.animations?.edges
        },
        layout: {
          ...(settings?.layout?.managedBy === 'forces'
            ? DEFAULT_FORCES_LAYOUT_ANIMATION_SETTINGS
            : DEFAULT_ANIMATION_SETTINGS),
          ...settings?.animations?.layout
        },
        vertices: {
          ...DEFAULT_ANIMATION_SETTINGS,
          ...settings?.animations?.vertices
        }
      },
      layout: updateGraphLayoutSettingsWithDefaults(settings?.layout)
    },
    targetBoundingRect: makeMutable({ bottom: 0, left: 0, right: 0, top: 0 })
  };
};

const updateGraphLayoutSettingsWithDefaults = <V, E>(
  settings?: GraphLayoutSettings
): GraphDataContextType<V, E>['settings']['layout'] => {
  switch (settings?.managedBy) {
    case 'forces':
      const updatedSettings = {
        ...DEFAULT_FORCES_STRATEGY_SETTINGS,
        ...settings
      };

      return {
        managedBy: 'forces',
        settings: {
          attractionForceFactor: makeMutable(1),
          attractionScale: makeMutable(1),
          repulsionScale: makeMutable(100000),
          strategy: makeMutable('default')
        }
      };
    case 'placement':
    default:
      return { managedBy: 'placement', ...settings };
  }
};

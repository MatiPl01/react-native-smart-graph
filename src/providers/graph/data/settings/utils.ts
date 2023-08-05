/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DEFAULT_GRAPH_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS,
  DEFAULT_PLACEMENT_SETTINGS,
  DEFAULT_RANDOM_PLACEMENT_SETTINGS,
  getDefaultGraphRenderers
} from '@/configs/graph';
import { Graph } from '@/types/graphs';
import { GraphRenderers } from '@/types/renderers';
import {
  DirectedGraphSettings,
  DirectedGraphSettingsWithDefaults,
  GraphSettings
} from '@/types/settings';
import { cancelAnimations } from '@/utils/animations';
import { createKeySet, deepMerge, updateValues } from '@/utils/objects';

import { GraphSettingsContextType } from './context';

export type GraphData<V, E> = {
  graph: Graph<V, E>;
  renderers?: GraphRenderers<V, E>;
  settings?: GraphSettings<V>;
};

const SHARED_KEYS = {
  components: {
    arrow: createKeySet(
      (DEFAULT_GRAPH_SETTINGS as DirectedGraphSettingsWithDefaults<unknown>)
        .components.arrow
    ),
    edge: createKeySet(DEFAULT_GRAPH_SETTINGS.components.edge),
    label: createKeySet(DEFAULT_GRAPH_SETTINGS.components.label),
    vertex: createKeySet(DEFAULT_GRAPH_SETTINGS.components.vertex)
  },
  focus: new Set(['disableGestures', 'points', 'progress']),
  layout: {
    auto: createKeySet(DEFAULT_LAYOUT_SETTINGS.auto, ['type']),
    forces: createKeySet(DEFAULT_LAYOUT_SETTINGS.forces, ['type'])
  },
  placement: {
    circle: createKeySet(DEFAULT_PLACEMENT_SETTINGS.circle),
    circles: createKeySet(DEFAULT_PLACEMENT_SETTINGS.circles),
    orbits: createKeySet(DEFAULT_PLACEMENT_SETTINGS.orbits),
    random: {
      grid: createKeySet(DEFAULT_RANDOM_PLACEMENT_SETTINGS.grid),
      random: createKeySet(DEFAULT_RANDOM_PLACEMENT_SETTINGS.random),
      triangular: createKeySet(DEFAULT_RANDOM_PLACEMENT_SETTINGS.triangular)
    },
    trees: createKeySet(DEFAULT_PLACEMENT_SETTINGS.trees)
  }
};

export const updateContextValue = <V, E>(
  { graph, renderers, settings }: GraphData<V, E>,
  value?: GraphSettingsContextType<V, E>
): GraphSettingsContextType<V, E> => {
  // DEFAULTS
  const defaultGraphRenderers = getDefaultGraphRenderers<V, E>(settings);
  const defaultLayoutSettings =
    DEFAULT_LAYOUT_SETTINGS[
      settings?.layout?.type ?? DEFAULT_GRAPH_SETTINGS.layout.type
    ];
  const defaultPlacementSettings =
    settings?.placement?.strategy === 'random'
      ? DEFAULT_RANDOM_PLACEMENT_SETTINGS[settings.placement?.mesh ?? 'grid']
      : DEFAULT_PLACEMENT_SETTINGS[
          settings?.placement?.strategy ??
            DEFAULT_GRAPH_SETTINGS.placement.strategy
        ];
  const sharedPlacementKeys =
    defaultPlacementSettings.strategy === 'random'
      ? SHARED_KEYS.placement[defaultPlacementSettings.strategy][
          defaultPlacementSettings.mesh ?? 'grid'
        ]
      : SHARED_KEYS.placement[defaultPlacementSettings.strategy];

  // RENDERERS
  const newRenderers = updateValues({
    current: value?.renderers,
    default: defaultGraphRenderers,
    new: renderers
  });

  // SETTINGS
  const newArrowComponentSettings = updateValues(
    {
      default: DEFAULT_GRAPH_SETTINGS.components.arrow,
      new: (settings as DirectedGraphSettings<V>)?.components?.arrow
    },
    SHARED_KEYS.components.arrow
  );
  const newEdgeComponentSettings = updateValues(
    {
      default: DEFAULT_GRAPH_SETTINGS.components.edge,
      new: settings?.components?.edge
    },
    SHARED_KEYS.components.edge
  );
  const newLabelComponentSettings = updateValues(
    {
      default: DEFAULT_GRAPH_SETTINGS.components.label,
      new: settings?.components?.label
    },
    SHARED_KEYS.components.label
  );
  const newVertexComponentSettings = updateValues(
    {
      default: DEFAULT_GRAPH_SETTINGS.components.vertex,
      new: settings?.components?.vertex
    },
    SHARED_KEYS.components.vertex
  );
  const newSettings = updateValues({
    current: value?.settings,
    new: {
      animations: value?.settings?.animations
        ? deepMerge(
            value?.settings?.animations,
            DEFAULT_GRAPH_SETTINGS.animations,
            settings?.animations
          )
        : deepMerge(DEFAULT_GRAPH_SETTINGS.animations, settings?.animations),
      components: updateValues({
        current: value?.settings?.components,
        new: {
          arrow: newArrowComponentSettings,
          edge: newEdgeComponentSettings,
          label: newLabelComponentSettings,
          vertex: newVertexComponentSettings
        }
      }),
      events: updateValues({
        current: value?.settings?.events,
        new: settings?.events
      }),
      layout: updateValues(
        {
          current: value?.settings?.layout,
          default: defaultLayoutSettings,
          new: settings?.layout
        },
        SHARED_KEYS.layout[defaultLayoutSettings.type]
      ),
      placement: updateValues(
        {
          current: value?.settings?.placement,
          default: defaultPlacementSettings,
          new: settings?.placement
        },
        sharedPlacementKeys as Set<any>
      )
    }
  });

  // CONTEXT VALUE
  return updateValues({
    current: value,
    new: {
      graph,
      renderers: newRenderers,
      settings: newSettings
    }
  });
};

export const createContextValue = <V, E>(
  data: GraphData<V, E>
): GraphSettingsContextType<V, E> => updateContextValue(data);

export const clearContextValue = <V, E>(
  value: GraphSettingsContextType<V, E>
): void => cancelAnimations(value);

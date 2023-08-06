/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DEFAULT_COMPONENTS_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS,
  DEFAULT_PLACEMENT_SETTINGS
} from '@/configs/graph';
import { cancelAnimations } from '@/utils/animations';
import { createKeySet, deepMerge, updateValues } from '@/utils/objects';

const SHARED_KEYS = {
  components: {
    arrow: createKeySet(DEFAULT_COMPONENTS_SETTINGS.arrow),
    edge: {
      curved: createKeySet(DEFAULT_COMPONENTS_SETTINGS.edge.curved, ['type']),
      straight: createKeySet(DEFAULT_COMPONENTS_SETTINGS.edge.straight, [
        'type'
      ])
    },
    label: createKeySet(DEFAULT_COMPONENTS_SETTINGS.label, ['displayed']),
    vertex: createKeySet(DEFAULT_COMPONENTS_SETTINGS.vertex)
  },
  focus: new Set(['disableGestures', 'points', 'progress']),
  layout: {
    auto: createKeySet(DEFAULT_LAYOUT_SETTINGS.auto, ['type']),
    forces: createKeySet(DEFAULT_LAYOUT_SETTINGS.force, ['type'])
  },
  placement: {
    circle: createKeySet(DEFAULT_PLACEMENT_SETTINGS.circle),
    circles: createKeySet(DEFAULT_PLACEMENT_SETTINGS.circles),
    orbits: createKeySet(DEFAULT_PLACEMENT_SETTINGS.orbits),
    random: {
      grid: createKeySet(DEFAULT_PLACEMENT_SETTINGS.random.grid),
      random: createKeySet(DEFAULT_PLACEMENT_SETTINGS.random.random),
      triangular: createKeySet(DEFAULT_PLACEMENT_SETTINGS.random.triangular)
    },
    trees: createKeySet(DEFAULT_PLACEMENT_SETTINGS.trees)
  }
};

export const updateContextValue = <V, E>(
  data: GraphData<V, E>,
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

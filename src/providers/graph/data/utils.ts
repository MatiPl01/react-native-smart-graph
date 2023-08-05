/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  cancelAnimation,
  isSharedValue,
  makeMutable,
  SharedValue
} from 'react-native-reanimated';

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
import { DeepPartial } from '@/types/utils';
import { cancelAnimations } from '@/utils/animations';
import { deepMerge } from '@/utils/objects';

import { GraphDataContextType } from './context';

export type GraphData<V, E> = {
  graph: Graph<V, E>;
  renderers: GraphRenderers<V, E>;
  settings: GraphSettings<V>;
};

type SettingsWithDefaults<C, N, D> = {
  current?: C;
  default: D;
  new?: N;
};

type SettingsWithoutDefaults<C, N> = {
  current?: C;
  new?: N;
};

const areSettingsWithDefaults = <C, N, D>(
  settings: SettingsWithDefaults<C, N, D> | SettingsWithoutDefaults<C, N>
): settings is SettingsWithDefaults<C, N, D> => {
  return 'default' in settings;
};

const updateValues = <
  C extends D | Record<keyof D, any>,
  N extends DeepPartial<D>,
  D extends Record<string, any>,
  K extends keyof (D | N)
>(
  settings: SettingsWithDefaults<C, N, D> | SettingsWithoutDefaults<C, N>,
  sharedKeys?: Set<K>
): C & Record<K, SharedValue<any>> => {
  const result = { ...settings.current } as C;
  let isModified = false;
  const keys = areSettingsWithDefaults(settings)
    ? Object.keys(settings.default)
    : settings.new
    ? Object.keys(settings.new)
    : [];

  // Add or update values
  for (const key of keys) {
    const value = areSettingsWithDefaults(settings)
      ? settings.new?.[key as keyof N] ?? settings.default[key as keyof D]
      : settings.new?.[key as keyof N];

    // SHARED VALUES
    if (sharedKeys?.has(key as K)) {
      const res = result as Record<string, SharedValue<any>>;
      // If the value passed by the user is a shared value
      if (isSharedValue(value)) {
        // If the value doesn't exist in the current settings or the new
        // shared value was passed by the user, update it
        if (res[key] !== value) {
          res[key] = value;
          isModified = true;
        }
      }
      // Otherwise
      else {
        // If the value doesn't exist in the current settings, add it
        // eslint-disable-next-line no-lonely-if
        if (!(key in res)) {
          res[key] = makeMutable(value);
          isModified = true;
        }
        // Otherwise, if the value exists in the current settings and was
        // changed, update it in place
        else if (res[key]!.value !== value) {
          res[key]!.value = value;
        }
      }
    }
    // NON-SHARED VALUES
    else {
      const res = result as Record<string, any>;
      // If the value doesn't exist in the current settings or exists
      // but was changed, update it
      if (res[key] !== value) {
        res[key] = value;
        isModified = true;
      }
    }
  }

  // Clear values that no longer exist
  for (const key in result) {
    if (!(key in keys)) {
      if (sharedKeys?.has(key as unknown as K)) {
        cancelAnimation(result[key]);
      }
      delete result[key];
      isModified = true;
    }
  }

  // Return the result if it was modified, otherwise return the current settings
  // (if modified in place, the current settings will be returned)
  return isModified ? result : settings.current!;
};

const createKeySet = <O extends Record<string, any>>(
  obj: O,
  exclude?: Array<string>
): Set<keyof O> => {
  const result = new Set(Object.keys(obj));
  if (exclude) {
    for (const key of exclude) {
      result.delete(key);
    }
  }
  return result;
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
  value?: GraphDataContextType<V, E>
): GraphDataContextType<V, E> => {
  // DEFAULTS
  const defaultGraphRenderers = getDefaultGraphRenderers<V, E>(settings);
  const defaultLayoutSettings =
    DEFAULT_LAYOUT_SETTINGS[
      settings.layout?.type ?? DEFAULT_GRAPH_SETTINGS.layout.type
    ];
  const defaultPlacementSettings =
    settings.placement?.strategy === 'random'
      ? DEFAULT_RANDOM_PLACEMENT_SETTINGS[settings.placement?.mesh ?? 'grid']
      : DEFAULT_PLACEMENT_SETTINGS[
          settings.placement?.strategy ??
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
  // ANIMATIONS SETTINGS
  // (deepMerge keeps references to values from the previous settings object if
  // they are not changed)
  const newAnimationsSettings = value?.settings?.animations
    ? deepMerge(
        value?.settings?.animations,
        DEFAULT_GRAPH_SETTINGS.animations,
        settings.animations
      )
    : deepMerge(DEFAULT_GRAPH_SETTINGS.animations, settings.animations);
  // COMPONENTS SETTINGS
  // Arrow component settings
  const newArrowComponentSettings = updateValues(
    {
      default: DEFAULT_GRAPH_SETTINGS.components.arrow,
      new: (settings as DirectedGraphSettings<V>)?.components?.arrow
    },
    SHARED_KEYS.components.arrow
  );
  // Edge component settings
  const newEdgeComponentSettings = updateValues(
    {
      default: DEFAULT_GRAPH_SETTINGS.components.edge,
      new: settings.components?.edge
    },
    SHARED_KEYS.components.edge
  );
  // Label component settings
  const newLabelComponentSettings = updateValues(
    {
      default: DEFAULT_GRAPH_SETTINGS.components.label,
      new: settings.components?.label
    },
    SHARED_KEYS.components.label
  );
  // Vertex component settings
  const newVertexComponentSettings = updateValues(
    {
      default: DEFAULT_GRAPH_SETTINGS.components.vertex,
      new: settings.components?.vertex
    },
    SHARED_KEYS.components.vertex
  );
  // EVENTS SETTINGS
  const newEventsSettings = updateValues({
    current: value?.settings?.events,
    new: settings.events
  });
  // LAYOUT SETTINGS
  const newLayoutSettings = updateValues(
    {
      current: value?.settings?.layout,
      default: defaultLayoutSettings,
      new: settings.layout
    },
    SHARED_KEYS.layout[defaultLayoutSettings.type]
  );
  // PLACEMENT SETTINGS
  const newPlacementSettings = updateValues(
    {
      current: value?.settings?.placement,
      default: defaultPlacementSettings,
      new: settings.placement
    },
    sharedPlacementKeys as Set<any>
  );

  // Update the context value
  const updatedValue: GraphDataContextType<V, E> = {
    graph,
    renderers: newRenderers,
    settings: {
      animations: newAnimationsSettings,
      components: {
        arrow: newArrowComponentSettings,
        edge: newEdgeComponentSettings,
        label: newLabelComponentSettings,
        vertex: newVertexComponentSettings
      },
      events: newEventsSettings,
      layout: newLayoutSettings,
      placement: newPlacementSettings
    }
  };

  return value
    ? deepMerge(value, updatedValue as DeepPartial<GraphDataContextType<V, E>>)
    : updatedValue;
};

export const createContextValue = <V, E>(
  data: GraphData<V, E>
): GraphDataContextType<V, E> => updateContextValue(data);

export const clearContextValue = <V, E>(
  value: GraphDataContextType<V, E>
): void => cancelAnimations(value);

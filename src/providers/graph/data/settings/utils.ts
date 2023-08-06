/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DEFAULT_COMPONENTS_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS,
  DEFAULT_PLACEMENT_SETTINGS,
  getDefaultConfig
} from '@/configs/graph';
import { GraphSettingsData } from '@/types/components';
import { GraphData } from '@/types/data';
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
    force: createKeySet(DEFAULT_LAYOUT_SETTINGS.force, ['type'])
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
  value?: GraphSettingsData<V, E>
): GraphSettingsData<V, E> => {
  const { graph, renderers, settings } = data;
  // DEFAULTS
  const { renderers: defaultRenderers, settings: defaultSettings } =
    getDefaultConfig(data);

  const placementSharedKeys =
    defaultSettings.placement.strategy === 'random'
      ? SHARED_KEYS.placement[defaultSettings.placement.strategy][
          defaultSettings.placement.mesh
        ]
      : SHARED_KEYS.placement[defaultSettings.placement.strategy];

  // CONTEXT VALUE
  return updateValues({
    current: value,
    new: {
      graph,
      renderers: updateValues({
        current: value?.renderers,
        default: defaultRenderers,
        new: renderers
      }),
      settings: updateValues({
        current: value?.settings,
        new: {
          animations: value?.settings?.animations
            ? // Ty to re-use existing animations settings
              deepMerge(
                value?.settings?.animations,
                defaultSettings.animations,
                settings?.animations
              )
            : // Otherwise, merge default animations settings with user settings
              deepMerge(defaultSettings.animations, settings?.animations),
          components: updateValues({
            current: value?.settings?.components,
            new: {
              arrow: updateValues(
                // TODO - fix type
                {
                  current: value?.settings?.components?.arrow,
                  default: defaultSettings.components.arrow,
                  new: settings?.components?.arrow
                },
                SHARED_KEYS.components.arrow
              ),
              edge: updateValues(
                {
                  current: value?.settings?.components?.edge,
                  default: defaultSettings.components.edge,
                  new: settings?.components?.edge
                },
                SHARED_KEYS.components.edge[
                  defaultSettings.components.edge.type
                ] // TODO - fix type
              ),
              label: updateValues(
                {
                  current: value?.settings?.components?.label,
                  default: defaultSettings.components.label,
                  new: settings?.components?.label
                },
                SHARED_KEYS.components.label
              ),
              vertex: updateValues(
                {
                  current: value?.settings?.components?.vertex,
                  default: defaultSettings.components.vertex,
                  new: settings?.components?.vertex
                },
                SHARED_KEYS.components.vertex
              )
            }
          }),
          events: updateValues({
            current: value?.settings?.events,
            new: settings?.events
          }),
          layout: updateValues(
            {
              current: value?.settings?.layout,
              default: defaultSettings.layout,
              new: settings?.layout
            },
            SHARED_KEYS.layout[defaultSettings.layout.type]
          ),
          placement: updateValues(
            {
              current: value?.settings?.placement,
              default: defaultSettings.placement,
              new: settings?.placement // TODO - fix type
            },
            placementSharedKeys
          )
        }
      })
    }
  });
};

export const createContextValue = <V, E>(
  data: GraphData<V, E>
): GraphSettingsData<V, E> => updateContextValue(data);

export const clearContextValue = <V, E>(value: GraphSettingsData<V, E>): void =>
  cancelAnimations(value);

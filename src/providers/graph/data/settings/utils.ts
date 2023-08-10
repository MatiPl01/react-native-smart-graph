import {
  DEFAULT_COMPONENTS_SETTINGS,
  DEFAULT_LAYOUT_SETTINGS,
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

  console.log(settings?.components?.vertex);

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
              arrow: graph.isDirected()
                ? updateValues(
                    {
                      current: value?.settings?.components?.arrow,
                      default: defaultSettings.components.arrow,
                      new: settings?.components?.arrow
                    },
                    SHARED_KEYS.components.arrow
                  )
                : undefined,
              edge: updateValues(
                {
                  current: value?.settings?.components?.edge,
                  default: defaultSettings.components.edge,
                  new: settings?.components?.edge
                },
                SHARED_KEYS.components.edge[
                  defaultSettings.components.edge.type
                ]
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
          focus: updateValues(
            {
              current: value?.settings?.focus,
              new: settings?.focus
            },
            SHARED_KEYS.focus
          ),
          layout: updateValues(
            {
              current: value?.settings?.layout,
              default: defaultSettings.layout,
              new: settings?.layout
            },
            SHARED_KEYS.layout[defaultSettings.layout.type]
          ),
          placement: updateValues({
            current: value?.settings?.placement,
            default: defaultSettings.placement,
            new: settings?.placement
          })
        }
      })
    }
  });
};

export const createContextValue = <V, E>(
  data: GraphData<V, E>
): GraphSettingsData<V, E> => {
  const res = updateContextValue(data);

  console.log('\n\n\n>>> res', res.settings.focus?.points, '\n\n\n\n\n');
  return res;
};

export const clearContextValue = <V, E>(value: GraphSettingsData<V, E>): void =>
  cancelAnimations(value);

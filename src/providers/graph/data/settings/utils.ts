import { getDefaultConfig, getUpdateConfig } from '@/configs/graph';
import { GraphSettingsData } from '@/types/components';
import { GraphData } from '@/types/data';
import {
  cancelAnimations,
  isAnimationSettingsObject
} from '@/utils/animations';
import { updateValues } from '@/utils/objects';

export const updateContextValue = <V, E>(
  data: GraphData<V, E>,
  value?: GraphSettingsData<V, E>
): GraphSettingsData<V, E> => {
  // DEFAULTS
  const defaultConfig = getDefaultConfig(data);

  data.animationSettings =
    !data.animationSettings || isAnimationSettingsObject(data.animationSettings)
      ? {
          edges: data.animationSettings,
          layout: data.animationSettings,
          vertices: data.animationSettings
        }
      : data.animationSettings;

  return updateValues(
    {
      current: value,
      default: {
        ...defaultConfig,
        graph: data.graph
      },
      new: data
    },
    getUpdateConfig(defaultConfig)
  ) as unknown as GraphSettingsData<V, E>;
};

export const createContextValue = <V, E>(
  data: GraphData<V, E>
): GraphSettingsData<V, E> => updateContextValue(data);

export const clearContextValue = <V, E>(value: GraphSettingsData<V, E>): void =>
  cancelAnimations(value);

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  cancelAnimation,
  isSharedValue,
  makeMutable,
  SharedValue
} from 'react-native-reanimated';

import {
  DeepPartial,
  DeepReplaceValue,
  MergeAll,
  ReplaceWithSharedValues,
  Unsharedify
} from '@/types/utils';

type SettingsWithDefaults<C, D, N> = {
  current?: C;
  default: D;
  new?: N;
};

type SettingsWithoutDefaults<C, N> = {
  current?: C;
  new?: N;
};

const areSettingsWithDefaults = <C, D, N>(
  settings: SettingsWithDefaults<C, D, N> | SettingsWithoutDefaults<C, N>
): settings is SettingsWithDefaults<C, D, N> => {
  return 'default' in settings;
};

const isEmpty = (obj?: any): boolean =>
  obj === null
    ? false
    : obj === undefined ||
      (typeof obj === 'object' && Object.keys(obj as object).length === 0);

export const updateValues = <
  D extends object,
  C extends object,
  N extends object,
  K extends DeepPartial<
    DeepReplaceValue<MergeAll<[D, C, N]>, string>
  > | void = void
>(
  settings: SettingsWithDefaults<C, D, N> | SettingsWithoutDefaults<C, N>,
  config?: K
): ReplaceWithSharedValues<D, K> => {
  const result = (
    (settings.current && !Array.isArray(settings.current)) ||
    (settings.new && !Array.isArray(settings.new)) ||
    (areSettingsWithDefaults(settings) && !Array.isArray(settings.default))
      ? { ...(settings.current ?? {}) }
      : [...(settings.current ?? [])]
  ) as C;

  let isModified = false;
  const keySet = new Set([
    ...(areSettingsWithDefaults(settings) ? Object.keys(settings.default) : []),
    ...(settings.new ? Object.keys(settings.new) : [])
  ]);

  // Add or update values
  for (const key of keySet) {
    const value = areSettingsWithDefaults(settings)
      ? isEmpty(settings.new?.[key as keyof N])
        ? settings.default[key as keyof D]
        : settings.new?.[key as keyof N]
      : settings.new?.[key as keyof N];

    // SHARED VALUES
    if (config?.[key as keyof K] === 'shared') {
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
    // OBJECTS
    else if (
      config?.[key as keyof K] !== 'shallow' &&
      value !== null &&
      typeof value === 'object' &&
      !isSharedValue(value)
    ) {
      if (result[key as keyof C] !== value) {
        result[key as keyof C] = updateValues(
          areSettingsWithDefaults(settings)
            ? {
                current: result[key as keyof C] as object,
                default: (settings.default?.[key as keyof D] ?? {}) as object,
                new: value
              }
            : { current: result[key as keyof C] as object, new: value },
          config?.[key as keyof K] as any
        ) as C[keyof C];
        isModified = true;
      }
    }
    // PRIMITIVES
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
    if (!keySet.has(key)) {
      if (config?.[key as unknown as keyof K] === 'shared') {
        cancelAnimation(result[key] as SharedValue<any>);
      }
      delete result[key];
      isModified = true;
    }
  }

  // Return the result if it was modified, otherwise return the current settings
  // (if modified in place, the current settings will be returned)
  return (isModified
    ? result
    : settings.current!) as unknown as ReplaceWithSharedValues<D, K>;
};

export const unsharedify = <T extends object>(obj?: T): Unsharedify<T> => {
  'worklet';
  const result = {} as Record<string, any>;
  for (const key in obj) {
    const k = key as unknown as keyof typeof result;
    const value = obj[key as keyof T];
    if (isSharedValue(value)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result[k] = (value as SharedValue<any>).value;
    } else if (typeof value === 'object' && value !== null) {
      result[k] = unsharedify(value);
    } else {
      result[k] = value;
    }
  }
  return result as Unsharedify<T>;
};

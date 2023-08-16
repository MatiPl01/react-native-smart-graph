/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import {
  cancelAnimation,
  isSharedValue,
  makeMutable,
  SharedValue
} from 'react-native-reanimated';

import { DeepPartial, SharedifyBy } from '@/types/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const deepEqual = (value1: any, value2: any): boolean => {
  // If either value is null or not an object, they are not deeply equal
  if (
    typeof value1 !== 'object' ||
    value1 === null ||
    typeof value2 !== 'object' ||
    value2 === null
  ) {
    return value1 === value2;
  }

  // If value1 and value2 are react components
  if (
    React.isValidElement(value1 as object) &&
    React.isValidElement(value2 as object)
  ) {
    if (value1.type !== value2.type) {
      return false;
    }
    return deepEqual(value1.props, value2.props);
  }

  // If value1 and value2 are Date objects and their time values are equal, they are deeply equal
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (Object.hasOwn(value1, 'getTime') && Object.hasOwn(value2, 'getTime')) {
    return (value1 as Date).getTime() === (value2 as Date).getTime();
  }

  const keys1 = Object.keys(value1 as object);
  const keys2 = Object.keys(value2 as object);

  // If the number of keys of both values is not the same, they are not deeply equal
  if (keys1.length !== keys2.length) {
    return false;
  }

  if (isSharedValue(value1) && isSharedValue(value2)) {
    return true;
  }

  // Check if every key of value1 exists in value2, and their values are deeply equal
  for (const key of keys1) {
    if (
      !keys2.includes(key) ||
      !deepEqual(
        (value1 as Record<string, any>)[key],
        (value2 as Record<string, any>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
};

const updateSettings = <S extends ExcludeSettings | IncludeSettings>(
  key: string,
  settings?: S
): S => {
  const regex = new RegExp(`^(${key}|\\*).`);

  if (isIncludeSettingsObject(settings)) {
    return {
      include: settings?.include
        ?.filter(prop => prop.match(regex))
        .map(prop => prop.replace(regex, '')),
      shallow: settings?.shallow
        ?.filter(prop => prop.match(regex))
        .map(prop => prop.replace(regex, ''))
    } as S;
  }

  return {
    exclude: settings?.exclude
      ?.filter(prop => prop.match(regex))
      .map(prop => prop.replace(regex, '')),
    shallow: settings?.shallow
      ?.filter(prop => prop.match(regex))
      .map(prop => prop.replace(regex, ''))
  } as S;
};

type ExcludeSettings = { exclude?: Array<string>; shallow?: Array<string> };
type IncludeSettings = { include?: Array<string>; shallow?: Array<string> };

const isIncludeSettingsObject = (
  settings?: ExcludeSettings | IncludeSettings
): settings is IncludeSettings =>
  !!settings && Object.hasOwn(settings, 'include');

export const deepMemoComparator =
  (settings?: ExcludeSettings | IncludeSettings) =>
  (prevProps: Record<string, any>, nextProps: Record<string, any>): boolean => {
    const shallowComparisonSet = new Set(settings?.shallow ?? []);

    const includeSet = isIncludeSettingsObject(settings)
      ? new Set(settings?.include ?? [])
      : null;
    const excludedSet = !includeSet
      ? new Set((settings as ExcludeSettings)?.exclude ?? [])
      : null;

    const prevPropsKeys = Object.keys(prevProps);
    const nextPropsKeys = Object.keys(nextProps);

    // Check if the number of keys of both values is not the same
    if (prevPropsKeys.length !== nextPropsKeys.length) {
      return false;
    }

    // Deeply compare every prop except the ones in the excluded list
    for (const key of nextPropsKeys) {
      if (excludedSet && (excludedSet.has(key) || excludedSet.has('*'))) {
        continue;
      } else if (includeSet && !includeSet.has(key)) {
        continue;
      }

      if (shallowComparisonSet.has(key) || shallowComparisonSet.has('*')) {
        if (prevProps[key] !== nextProps[key]) return false;
        continue;
      }

      if (
        // If the beginning of the excluded prop matches the current prop,
        // recursively call deepMemoComparator for nested properties
        (excludedSet &&
          (settings as ExcludeSettings)?.exclude?.some(
            prop => prop.startsWith(`${key}.`) || prop.startsWith('*.')
          )) ||
        // If the beginning of the included prop matches the current prop,
        // recursively call deepMemoComparator for nested properties
        (includeSet &&
          (settings as IncludeSettings)?.include?.some(
            prop => prop.startsWith(`${key}.`) || prop.startsWith('*.')
          )) ||
        // If the beginning of the shallow prop matches the current prop,
        // recursively call deepMemoComparator for nested properties
        settings?.shallow?.some(
          prop => prop.startsWith(`${key}.`) || prop.startsWith('*.')
        )
      ) {
        const isPrevReactElement = React.isValidElement(
          prevProps[key] as object
        );
        const isNextReactElement = React.isValidElement(
          nextProps[key] as object
        );

        if (isPrevReactElement !== isNextReactElement) {
          return false;
        }

        if (
          !deepMemoComparator(updateSettings(key, settings))(
            (isPrevReactElement
              ? prevProps[key].props
              : prevProps[key]) as Record<string, any>,
            (isNextReactElement
              ? nextProps[key].props
              : nextProps[key]) as Record<string, any>
          )
        ) {
          return false;
        }
      } else if (!deepEqual(prevProps[key], nextProps[key])) {
        return false;
      }
    }

    return true;
  };

// TODO - fix
const deepMergeHelper = <T extends Record<string, any>>(
  obj1: T,
  obj2?: DeepPartial<T>
): T => {
  if (obj2 === undefined) return obj1;

  console.log(obj1, obj2);
  return obj1; // TODO - remove

  const result = (Array.isArray(obj1) && Array.isArray(obj2) ? [] : {}) as T;
  let isModified = false;

  for (const key in obj2) {
    if (
      Object.hasOwn(obj1, key) &&
      typeof obj1[key] === 'object' &&
      obj1[key] !== null &&
      typeof obj2[key] === 'object' &&
      obj2[key] !== null
    ) {
      // If references are equal, no need to merge
      if (obj1[key] === obj2[key]) {
        result[key] = obj1[key];
        continue;
      }
      const mergedChild = deepMergeHelper(obj1[key], obj2[key]);
      isModified = isModified || mergedChild !== obj1[key];
      result[key] = mergedChild;
    } else {
      result[key] = obj1[key];
      isModified = isModified || obj2[key] !== obj1[key];
    }
  }

  for (const key in obj1) {
    if (!Object.hasOwn(obj2, key)) {
      console.log(key, obj1[key]);
      // result[key] = obj1[key];
      isModified = true;
    }
  }

  return isModified ? result : obj1;
};

export const deepMerge = <T extends Record<string, any>>(
  obj1: T,
  ...objs: Array<DeepPartial<T> | undefined>
): T => {
  return objs.reduce((acc, obj) => deepMergeHelper(acc, obj), obj1);
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

export const updateValues = <
  C extends D | Record<keyof D, any>,
  N extends DeepPartial<D>,
  D extends Record<string, any>,
  K extends string = never
>(
  settings: SettingsWithDefaults<C, N, D> | SettingsWithoutDefaults<C, N>,
  sharedKeys?: Set<K>
): C & SharedifyBy<N, K> => {
  const result = { ...settings.current } as C;
  let isModified = false;
  const keySet = new Set(
    areSettingsWithDefaults(settings)
      ? Object.keys(settings.default)
      : settings.new
      ? Object.keys(settings.new)
      : []
  );

  // Add or update values
  for (const key of keySet) {
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
    if (!keySet.has(key)) {
      if (sharedKeys?.has(key as unknown as K)) {
        cancelAnimation(result[key]);
      }
      delete result[key];
      isModified = true;
    }
  }

  // Return the result if it was modified, otherwise return the current settings
  // (if modified in place, the current settings will be returned)
  return (isModified ? result : settings.current!) as C & SharedifyBy<N, K>;
};

export const createKeySet = <O extends Record<string, any>>(
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

export const removeValueWithKey = <
  T extends Record<string, any>,
  K extends keyof T
>(
  obj: T,
  key: K
): Omit<T, K> =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key)) as Omit<
    T,
    K
  >;

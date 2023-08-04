/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { isSharedValue } from 'react-native-reanimated';

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

type ExcludeSettings = { exclude?: string[]; shallow?: string[] };
type IncludeSettings = { include?: string[]; shallow?: string[] };

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

/*
 * Customizes values of the properties that are being merged.
 *
 * @param oldValue - the value of the property in the old object
 * @param newValue - the value of the property in the new object
 *
 * @returns - the resulting value that will be used after merging
 *            the old and new values (if undefined is returned, the value
 *            will be removed from the resulting object)
 */
type CustomizerValue = boolean | null | number | object | string | undefined;
type Customizer = (props: {
  key: string;
  newValue: CustomizerValue;
  oldValue: CustomizerValue;
}) => CustomizerValue;

export const mergeObjects = <R>(
  oldObject: Record<string, any>,
  newObject: Record<string, any>,
  customizer?: Customizer,
  propKey = ''
): R => {
  // Use the customizer if it is provided
  let newObj = newObject;
  if (customizer) {
    // Call the customizer with the old and new values
    const value = customizer({
      key: propKey,
      newValue: newObject,
      oldValue: oldObject
    });
    // If the customizer returns undefined, remove the value from the resulting object
    if (value === undefined) return undefined as R;
    // If oldObject is returned, the value will not be modified
    if (value === oldObject) return oldObject as R;
    // Otherwise, use the value returned by the customizer as the new Object
    // and continue with the merge
    newObj = value as any;
  }

  // If at least one of the values is not an object or is null, return the new value
  if (
    typeof oldObject !== 'object' ||
    oldObject === null ||
    typeof newObj !== 'object' ||
    newObj === null
  ) {
    return newObj as R;
  }

  // Iterate over the new object and merge its properties with the old object
  const result = (
    Array.isArray(newObj) && Array.isArray(oldObject) ? [] : {}
  ) as Record<string, any>;
  let isModified = false;

  for (const key in newObj) {
    const value = mergeObjects(
      oldObject[key],
      (newObj as Record<string, any>)[key],
      customizer,
      key
    );
    isModified ||= value !== oldObject[key];
    result[key] = value;
  }

  // Add keys from the old object that are not in the new object
  for (const key in oldObject) {
    if (!Object.hasOwn(newObject, key)) {
      result[key] = oldObject[key];
    }
  }

  return (isModified ? result : oldObject) as R;
};

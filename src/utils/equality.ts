/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';

const isSharedValue = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && Object.hasOwn(value, 'value');

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

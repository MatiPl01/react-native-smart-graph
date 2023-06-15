/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
const deepEqual = (value1: any, value2: any): boolean => {
  // If either value is null or not an object, they are not deeply equal
  if (
    typeof value1 !== 'object' ||
    value1 === null ||
    typeof value2 !== 'object' ||
    value2 === null
  ) {
    return value1 === value2;
  }

  // If value1 and value2 are Date objects and their time values are equal, they are deeply equal
  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() === value2.getTime();
  }

  const keys1 = Object.keys(value1 as object);
  const keys2 = Object.keys(value2 as object);

  // If the number of keys of both values is not the same, they are not deeply equal
  if (keys1.length !== keys2.length) {
    return false;
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

export const deepMemoComparator =
  (settings?: { shallow?: string[]; exclude?: string[] }) =>
  (prevProps: Record<string, any>, nextProps: Record<string, any>): boolean => {
    const shallowComparisonSet = new Set(settings?.shallow ?? []);
    const excludedSet = new Set(settings?.exclude ?? []);

    const prevPropsKeys = Object.keys(prevProps);
    const nextPropsKeys = Object.keys(nextProps);

    // Check if the number of keys of both values is not the same
    if (prevPropsKeys.length !== nextPropsKeys.length) {
      return false;
    }

    // Deeply compare every prop except the ones in the excluded list
    for (const key of Object.keys(prevProps)) {
      if (excludedSet.has(key)) {
        continue;
      }

      if (shallowComparisonSet.has(key) && prevProps[key] !== nextProps[key]) {
        return false;
      }

      const isPrevPropReactElement = React.isValidElement(
        prevProps[key] as object
      );
      const isNextPropReactElement = React.isValidElement(
        nextProps[key] as object
      );

      if (isPrevPropReactElement && isNextPropReactElement) {
        // If the prop is a React component, compare the component's type and props
        const regex = new RegExp(`^${key}.`);
        if (
          prevProps[key].type !== nextProps[key].type ||
          !deepMemoComparator({
            shallow: settings?.shallow
              ?.filter(prop => prop.match(regex))
              .map(prop => prop.replace(regex, ''))
          })(
            prevProps[key].props as Record<string, any>,
            nextProps[key].props as Record<string, any>
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

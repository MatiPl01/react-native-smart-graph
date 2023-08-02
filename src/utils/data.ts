/* eslint-disable import/no-unused-modules */
import { isEqual } from 'lodash-es';

import { DeepPartial } from '@/types/utils';

export const deepMerge = <T extends object>(
  oldObj: T,
  newObj: DeepPartial<T>
): T => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  if (isEqual(oldObj, newObj)) return oldObj;

  if (
    typeof oldObj !== 'object' ||
    typeof newObj !== 'object' ||
    oldObj === null ||
    newObj === null
  ) {
    return { ...oldObj, ...newObj } as T;
  }

  const result: DeepPartial<T> = {};

  for (const key in oldObj) {
    if (newObj.hasOwnProperty(key)) {
      result[key] = deepMerge(
        oldObj[key] as T,
        newObj[key] as DeepPartial<T>
      ) as T[keyof T];
    } else {
      result[key] = oldObj[key] as T[keyof T];
    }
  }

  for (const key in newObj) {
    if (!oldObj.hasOwnProperty(key)) {
      result[key] = newObj[key];
    }
  }

  return result as T;
};

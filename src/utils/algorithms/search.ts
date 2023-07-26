/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const binarySearchLE = <T>(
  values: Array<T>,
  targetValue: number,
  valueExtractor: (value: T) => number
): number => {
  'worklet';
  if (!values.length) {
    return -1;
  }

  let left = 0;
  let right = values.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = valueExtractor(values[mid]!);

    if (value > targetValue) {
      right = mid - 1;
    } else if (value < targetValue) {
      left = mid + 1;
    } else {
      return mid;
    }
  }

  return left;
};

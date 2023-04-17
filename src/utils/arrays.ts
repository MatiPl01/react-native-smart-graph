// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const zipArrays = <T extends any[]>(
  ...arrays: T
): Array<{ [K in keyof T]: T[K] extends Array<infer U> ? U : never }> => {
  const zippedArray: Array<{
    [K in keyof T]: T[K] extends Array<infer U> ? U : never;
  }> = [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  const minLength = Math.min(...arrays.map(arr => arr.length));

  for (let i = 0; i < minLength; i++) {
    const tuple = [];

    for (const arr of arrays) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      tuple.push(arr[i]);
    }

    if (tuple.length > 0) {
      zippedArray.push(
        tuple as {
          [K in keyof T]: T[K] extends Array<infer U> ? U : never;
        }
      );
    }
  }

  return zippedArray;
};

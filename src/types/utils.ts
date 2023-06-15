/* eslint-disable @typescript-eslint/no-explicit-any */
// https://stackoverflow.com/questions/57835286/deep-recursive-requiredt-on-specific-properties
export type DeepRequired<T, P extends Array<string>> = T extends object
  ? Omit<T, Extract<keyof T, P[0]>> &
      Required<{
        [K in Extract<keyof T, P[0]>]: NonNullable<
          DeepRequired<T[K], ShiftUnion<K, P>>
        >;
      }>
  : T;

type Shift<T extends Array<any>> = ((...t: T) => any) extends (
  first: any,
  ...rest: infer Rest
) => any
  ? Rest
  : never;

type ShiftUnion<
  P extends PropertyKey,
  T extends Array<any>
> = T extends Array<any> ? (T[0] extends P ? Shift<T> : never) : never;

export type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};

export type DeepRequiredAll<T> = {
  [K in keyof T]: DeepRequiredAll<T[K]>;
} & Required<T>;

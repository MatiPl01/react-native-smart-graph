/* eslint-disable @typescript-eslint/no-explicit-any */
import { SharedValue } from 'react-native-reanimated';

export type DeepRequired<T> = {
  [K in keyof T]: DeepRequired<T[K]>;
} & Required<T>;

export type RequiredWithout<T, E extends keyof T> = Required<Omit<T, E>> &
  Partial<Pick<T, E>>;

export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type PartialWithRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

export type Sharedify<T> = {
  [K in keyof T]: undefined extends T[K]
    ? Exclude<T[K], undefined> extends infer U
      ? SharedValue<U> | undefined
      : never
    : SharedValue<T[K]>;
};

export type SharedifyBy<T, K extends keyof T> = Omit<T, K> &
  Sharedify<Pick<T, K>>;

export type DeepSharedify<T> = {
  [K in keyof T]: T[K] extends object ? DeepSharedify<T[K]> : SharedValue<T[K]>;
};

export type SharedifyWithout<T, E extends keyof any = never> = {
  [K in keyof T]: K extends E ? T[K] : SharedValue<T[K]>;
};

export type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};

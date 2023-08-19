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

export type DeepSharedify<T> = {
  [K in keyof T]: T[K] extends SharedValue<infer U> | infer U | undefined
    ? SharedValue<U>
    : T[K] extends object
    ? DeepSharedify<T[K]>
    : SharedValue<T[K]>;
};

export type SharedifyWithout<T, E extends keyof any = never> = {
  [K in keyof T]: K extends E
    ? T[K]
    : T[K] extends SharedValue<infer U> | infer U | undefined
    ? SharedValue<U>
    : SharedValue<T[K]>;
};

export type Sharedify<T> = {
  [K in keyof T]: T[K] extends SharedValue<any>
    ? T[K]
    : T[K] extends infer U | undefined
    ? U extends undefined
      ? SharedValue<U> | undefined
      : SharedValue<U>
    : never;
};

export type Unsharedify<T> = T extends (...args: Array<any>) => any
  ? T // Leaves function type as is
  : T extends SharedValue<infer U>
  ? U
  : T extends object
  ? { [P in keyof T]: Unsharedify<T[P]> }
  : T;

export type Sharedifyable<T> = SharedValue<T> | T;

export type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};

export type DeepReplaceValue<T, V> = {
  [P in keyof T]: T[P] extends object | undefined
    ? DeepReplaceValue<NonNullable<T[P]>, V> | V | undefined
    : V;
};

export type ReplaceWithSharedValues<T, R> = R extends Record<string, any>
  ? {
      [P in keyof T]: P extends keyof R
        ? T[P] extends SharedValue<infer U>
          ? SharedValue<U>
          : R[P] extends 'shared'
          ? SharedValue<T[P]>
          : R[P] extends 'shallow'
          ? T[P]
          : R[P] extends Record<string, any>
          ? ReplaceWithSharedValues<T[P], R[P]>
          : T[P]
        : T[P];
    }
  : T;

type DeepMerge<U> = U extends object
  ? { [K in keyof U]: U[K] extends object ? DeepMerge<U[K]> : U[K] }
  : U;

export type MergeAll<T> = T extends [infer Head, ...infer Tail]
  ? Tail extends []
    ? Head
    : DeepMerge<Head & MergeAll<Tail>>
  : unknown;

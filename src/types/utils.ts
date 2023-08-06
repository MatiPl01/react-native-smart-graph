import { SharedValue } from 'react-native-reanimated';

export type DeepRequire<T> = {
  [K in keyof T]: DeepRequire<T[K]>;
} & Required<T>;

export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type PartialWithRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

export type DeepSharedify<T> = {
  [K in keyof T]: T[K] extends object ? DeepSharedify<T[K]> : SharedValue<T[K]>;
};

type UnwrapSharedValue<T> = T extends SharedValue<infer U> ? U : T;

export type SharedifyBy<T, K extends keyof T> = T & {
  [P in K]: SharedValue<UnwrapSharedValue<T[P]>>;
};

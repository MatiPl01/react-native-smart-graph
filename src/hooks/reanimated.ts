import {
  isSharedValue,
  SharedValue,
  useDerivedValue
} from 'react-native-reanimated';

import { Sharedifyable } from '@/types/utils';

export const useSharedifyableValue = <T>(
  value: Sharedifyable<T>
): SharedValue<T> =>
  isSharedValue<T>(value) ? value : useDerivedValue(() => value, [value]);

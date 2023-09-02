import { SharedValue } from 'react-native-reanimated';

import { PressEventsSettings } from '@/types/settings/public';

export type InternalPressEventsSettings<V> = Omit<
  PressEventsSettings<V>,
  'disableAnimation'
> & {
  disableAnimation: SharedValue<boolean>;
};

export type InternalGraphEventsSettings<V> = {
  press?: InternalPressEventsSettings<V>;
};

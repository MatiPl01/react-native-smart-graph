import {
  GraphEventsSettings,
  MultiStepFocusSettings
} from '@/types/settings/public';

import { AllGraphAnimationsSettings } from './animations';
import { AllGraphLayoutSettings } from './layout';
import { AllGraphPlacementSettings } from './placement';

type SharedAllGraphSettings<V> = {
  animations: AllGraphAnimationsSettings;
  events?: GraphEventsSettings<V>;
  focus?: MultiStepFocusSettings;
  layout: AllGraphLayoutSettings;
  placement: AllGraphPlacementSettings;
};

export * from './animations';
export * from './components';
export * from './focus';
export * from './layout';
export * from './placement';

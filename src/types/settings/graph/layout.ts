import { ForcesSettings } from '@/types/settings/forces';
import { DeepRequiredAll } from '@/types/utils';

export type GraphLayoutType = 'auto' | 'forces';

export type AutoLayoutSettings = {
  type: 'auto';
};

export type ForcesLayoutSettings = {
  type: 'forces';
  settings?: ForcesSettings;
};

export type ForcesLayoutSettingsWithDefaults =
  DeepRequiredAll<ForcesLayoutSettings>;

export type GraphLayoutSettings = AutoLayoutSettings | ForcesLayoutSettings;

export type GraphLayoutSettingsWithDefaults =
  | AutoLayoutSettings
  | ForcesLayoutSettingsWithDefaults;

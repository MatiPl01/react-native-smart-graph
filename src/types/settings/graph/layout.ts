import { ForcesSettings } from '@/types/settings/forces';
import { DeepRequiredAll } from '@/types/utils';

export type GraphLayoutType = 'auto' | 'forces';

export type AutoLayoutSettings = {
  managedBy: 'placement';
};

export type ForcesLayoutSettings = {
  managedBy: 'forces';
  settings?: ForcesSettings;
};

export type ForcesLayoutSettingsWithDefaults =
  DeepRequiredAll<ForcesLayoutSettings>;

export type GraphLayoutSettings = AutoLayoutSettings | ForcesLayoutSettings;

export type GraphLayoutSettingsWithDefaults =
  | AutoLayoutSettings
  | ForcesLayoutSettingsWithDefaults;

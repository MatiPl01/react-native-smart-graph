import { ForcesSettings } from '@/types/settings/forces';
import { DeepRequiredAll } from '@/types/utils';

export type AutoLayoutSettings = {
  type: 'auto';
};

export type ForcesLayoutSettings = {
  settings?: ForcesSettings;
  type: 'forces';
};

export type ForcesLayoutSettingsWithDefaults =
  DeepRequiredAll<ForcesLayoutSettings>;

export type GraphLayoutSettings = AutoLayoutSettings | ForcesLayoutSettings;

export type GraphLayoutSettingsWithDefaults =
  | AutoLayoutSettings
  | ForcesLayoutSettingsWithDefaults;

export type LayoutType = GraphLayoutSettingsWithDefaults['type'];

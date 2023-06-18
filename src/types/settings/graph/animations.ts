import {
  AnimationSettings,
  AnimationSettingsWithDefaults
} from '@/types/settings/animations';

export type GraphAnimationsSettings = {
  edges?: AnimationSettings;
  layout?: AnimationSettings;
  vertices?: AnimationSettings;
};

export type GraphAnimationsSettingsWithDefaults = {
  edges: AnimationSettingsWithDefaults;
  layout: AnimationSettingsWithDefaults;
  vertices: AnimationSettingsWithDefaults;
};

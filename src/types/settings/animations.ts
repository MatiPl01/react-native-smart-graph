import {
  AnimationSettings,
  AnimationSettingsWithDefaults
} from '@/types/animations';

export type GraphAnimationsSettings = {
  layout?: AnimationSettings;
  vertices?: AnimationSettings;
  edges?: AnimationSettings;
};

export type GraphAnimationsSettingsWithDefaults = {
  layout: AnimationSettingsWithDefaults;
  vertices: AnimationSettingsWithDefaults;
  edges: AnimationSettingsWithDefaults;
};

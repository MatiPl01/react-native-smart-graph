import {
  AnimationSettings,
  GraphAnimationsSettings
} from '@/types/settings/public/graph/animations';
import { DeepRequiredAll } from '@/types/utils';

export type AllAnimationSettings = DeepRequiredAll<
  Omit<AnimationSettings, 'onComplete'>
>;

export type AllGraphAnimationsSettings = Record<
  keyof GraphAnimationsSettings,
  AllAnimationSettings
>;

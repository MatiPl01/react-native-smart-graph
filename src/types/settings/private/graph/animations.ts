import {
  AnimationSettings,
  GraphAnimationsSettings
} from '@/types/settings/public/graph/animations';
import { DeepRequire } from '@/types/utils';

export type AllAnimationSettings = DeepRequire<
  Omit<AnimationSettings, 'onComplete'>
> &
  Pick<AnimationSettings, 'onComplete'>;

export type AllGraphAnimationsSettings = Record<
  keyof GraphAnimationsSettings,
  AllAnimationSettings
>;

export type GraphModificationAnimationsSettings = {
  edges: Record<string, AnimationSettings | undefined>;
  layout?: AnimationSettings;
  vertices: Record<string, AnimationSettings | undefined>;
};

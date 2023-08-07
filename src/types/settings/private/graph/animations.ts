import {
  AnimationSettings,
  GraphAnimationsSettings
} from '@/types/settings/public/graph/animations';
import { DeepRequired } from '@/types/utils';

export type AllAnimationSettings = DeepRequired<
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

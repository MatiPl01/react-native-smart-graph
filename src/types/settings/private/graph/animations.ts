import { AnimationSettings } from '@/types/settings/public/graph/animations';
import { DeepRequired } from '@/types/utils';

export type AllAnimationSettings = DeepRequired<
  Omit<AnimationSettings, 'onComplete'>
> &
  Pick<AnimationSettings, 'onComplete'>;

export type AllGraphAnimationsSettings = {
  edges: AllAnimationSettings | null;
  layout: AllAnimationSettings | null;
  vertices: AllAnimationSettings | null;
};

export type GraphModificationAnimationsSettings = {
  edges: Record<string, AnimationSettings | undefined>;
  layout?: AnimationSettings;
  vertices: Record<string, AnimationSettings | undefined>;
};

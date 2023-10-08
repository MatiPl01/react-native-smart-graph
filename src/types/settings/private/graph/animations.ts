import { AnimationSettings } from '@/types/settings/public/graph/animations';
import { DeepRequired, Maybe } from '@/types/utils';

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
  edges: Record<string, Maybe<AnimationSettings>> | null;
  layout?: AnimationSettings | null;
  vertices: Record<string, Maybe<AnimationSettings>> | null;
};

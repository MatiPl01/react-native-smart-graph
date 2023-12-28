import { EasingFunction, EasingFunctionFactory } from 'react-native-reanimated';

import { Maybe } from '@/types/utils';

export type AnimationSettings = {
  duration?: number;
  easing?: AnimationEasing;
  onComplete?: (finished?: boolean) => void;
};

export type SingleModificationAnimationSettings =
  | {
      component?: Maybe<AnimationSettings>;
      layout?: Maybe<AnimationSettings>;
    }
  | Maybe<AnimationSettings>;

export type BatchModificationAnimationSettings =
  | {
      components?: Maybe<AnimationSettings>;
      layout?: Maybe<AnimationSettings>;
    }
  | {
      edges?:
        | Maybe<AnimationSettings>
        | Maybe<Record<string, Maybe<AnimationSettings>>>;
      layout?: Maybe<AnimationSettings>;
      vertices?:
        | Maybe<AnimationSettings>
        | Maybe<Record<string, Maybe<AnimationSettings>>>;
    }
  | Maybe<AnimationSettings>;

export type GraphAnimationsSettings = {
  edges?: Maybe<AnimationSettings>;
  layout?: Maybe<AnimationSettings>;
  vertices?: Maybe<AnimationSettings>;
} | null;

export type AnimationEasing = EasingFunction | EasingFunctionFactory;

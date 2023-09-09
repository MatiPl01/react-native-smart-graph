import { Vector } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

import { FocusContextType } from '@/providers/view';
import { GraphViewData } from '@/types/components';
import { Dimensions } from '@/types/layout';
import {
  AllAnimationSettings,
  FocusPoint,
  InternalMultiStepFocusSettings
} from '@/types/settings';
import { DeepRequired, Maybe } from '@/types/utils';

import { VertexComponentData, VertexTransformation } from './vertex';

export type FocusConfig = {
  canvasDimensions: Dimensions;
  vertexRadius: number;
};

export type MappingSourcePoint = {
  startsAt: number;
  transform: VertexTransformation;
};

export type FocusPointMapping<V> = {
  from: MappingSourcePoint;
  to: FocusStepData<V>;
};

export type FocusBoundsMapping = Record<
  'from' | 'to',
  {
    max: number;
    min: number;
  }
>;

export type FocusPath<V> = {
  points: Array<FocusPointMapping<V>>;
  progressBounds: FocusBoundsMapping;
};

export type TransformedFocusPoint = {
  key: string;
  startsAt: number;
  transform: VertexTransformation;
};

export type TransformedFocusData = {
  afterStep: TransformedFocusPoint | null;
  beforeStep: TransformedFocusPoint | null;
  // Updated current step index
  currentStepIdx: number;
  // Progress of the focus target transition
  pointsTransitionProgress: number;
  // Progress of the focused vertex animation
  targetAnimationProgress: number;
};

export type FocusData = {
  customSource?: boolean;
  gesturesDisabled?: boolean;
  key: string;
};

export type BlurData = {
  customSource?: boolean;
  origin?: Vector;
};

export type FocusStartHandler = (
  data: FocusData,
  animationSettings?: Maybe<AllAnimationSettings>
) => void;

export type FocusEndHandler = (
  data?: Maybe<BlurData>,
  animationSettings?: Maybe<AllAnimationSettings>
) => void;

export type FocusStepData<V> = {
  point: DeepRequired<FocusPoint>;
  startsAt: number;
  vertex: VertexComponentData<V>;
};

export type MultiStepFocusStateProps = {
  data: TransformedFocusData;
  focusContext: FocusContextType;
  progress: {
    current: number;
    previous: number;
  };
  settings: InternalMultiStepFocusSettings;
  syncProgress: number;
  targetPoint: SharedValue<TransformedFocusPoint | null>;
  viewDataContext: GraphViewData;
};

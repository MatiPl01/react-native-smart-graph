import { SharedValue } from 'react-native-reanimated';

import {
  AnimatedBoundingRect,
  AnimatedDimensions,
  AnimatedVectorCoordinates,
  BoundingRect,
  ObjectFit
} from '@/types/layout';

export type GraphViewData = {
  autoSizingEnabled: SharedValue<boolean>;
  autoSizingTimeout: SharedValue<number>;
  boundingRect: AnimatedBoundingRect;
  canvasDimensions: AnimatedDimensions;
  currentScale: SharedValue<number>;
  currentTranslation: AnimatedVectorCoordinates;
  gesturesDisabled: SharedValue<boolean>;
  initialScale: SharedValue<number>;
  initialScaleProvided: SharedValue<boolean>;
  isGestureActive: SharedValue<boolean>;
  isRendered: SharedValue<boolean>;
  maxScale: SharedValue<number>;
  minScale: SharedValue<number>;
  objectFit: SharedValue<ObjectFit>;
  padding: SharedValue<BoundingRect>;
  scales: SharedValue<Array<number>>;
  targetBoundingRect: SharedValue<BoundingRect>;
};

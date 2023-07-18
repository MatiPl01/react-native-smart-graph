import { Vector } from '@shopify/react-native-skia';
import { PropsWithChildren, useEffect } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import EASING from '@/constants/easings';
import { HIT_SLOP, LONG_PRESS_DURATION, PRESS_SLOP } from '@/constants/events';
import { withGraphData } from '@/providers/graph/data';
import { AnimatedCanvasTransform } from '@/types/canvas';
import { VertexComponentRenderData } from '@/types/components';
import { PressGesturesObserver } from '@/types/gestures';
import { GraphEventsSettings, VertexPressHandler } from '@/types/settings';
import { absoluteCoordinatesToCanvasCoordinates } from '@/utils/algorithms';
import { findPressedVertex } from '@/utils/layout';
import {
  animatedVectorCoordinatesToVector,
  distanceBetweenVectors
} from '@/utils/vectors';

const LONG_PRESS_DELAY = 250;
const PULSE_DURATION = 150;

const PRESS_MAX_SCALE = 1.3;
const LONG_PRESS_MAX_SCALE = 1.15;

const pulseAnimation = (activeScale: number): number => {
  'worklet';
  return withSequence(
    withTiming(activeScale, { duration: 100 }),
    withTiming(1, { duration: 100 })
  );
};

type VertexPressEventsProviderProps = PropsWithChildren<{
  pressGesturesObserver: SharedValue<PressGesturesObserver | null>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphEventsSettings;
  transform: AnimatedCanvasTransform;
  vertexRadius: number;
}>;

function VertexPressEventsProvider({
  children,
  pressGesturesObserver,
  renderedVerticesData,
  settings,
  transform,
  vertexRadius
}: VertexPressEventsProviderProps) {
  const pressStartCoordinates = useSharedValue<Vector | null>(null);
  const pressedVertexKey = useSharedValue<null | string>(null);
  const wasShortPress = useSharedValue(false);
  const previousPressedVertexKey = useSharedValue<null | string>(null);
  const pressProgress = useSharedValue(0);

  const callCallback = (callback: VertexPressHandler, key: string) => {
    callback(key);
  };

  const callPressCallback = (key: string) => {
    if (settings.onVertexPress) {
      callCallback(settings.onVertexPress, key);
    }
  };

  const callLongPressCallback = (key: string) => {
    if (settings.onVertexLongPress) {
      callCallback(settings.onVertexLongPress, key);
    }
  };

  const handlePressIn = (position: Vector) => {
    'worklet';
    wasShortPress.value = false;
    pressStartCoordinates.value = position;
  };

  const handlePressOut = () => {
    'worklet';
    pressStartCoordinates.value = null;
  };

  const handlePress = () => {
    'worklet';
    const key = pressedVertexKey.value;
    if (!key) return;
    wasShortPress.value = true;
    pressProgress.value = pulseAnimation(PRESS_MAX_SCALE);
    runOnJS(callPressCallback)(key);
    pressedVertexKey.value = null;
  };

  const handleLongPress = () => {
    'worklet';
    const key = pressedVertexKey.value;
    if (!key) return;
    runOnJS(callLongPressCallback)(key);
    pressedVertexKey.value = null;
  };

  // Set the pressed vertex key when the press starts
  // and the press is on a vertex
  useAnimatedReaction(
    () => pressStartCoordinates.value,
    pressedCoordinates => {
      if (pressedVertexKey.value) {
        return;
      }
      if (!pressedCoordinates) {
        pressedVertexKey.value = null;
        return;
      }
      previousPressedVertexKey.value = pressedVertexKey.value =
        findPressedVertex(
          absoluteCoordinatesToCanvasCoordinates(
            pressedCoordinates,
            {
              x: transform.translateX.value,
              y: transform.translateY.value
            },
            transform.scale.value
          ),
          vertexRadius,
          HIT_SLOP,
          renderedVerticesData
        );
    },
    [renderedVerticesData, vertexRadius]
  );

  // Cancel press event if vertex moved too far
  useAnimatedReaction(
    () => {
      const key = pressedVertexKey.value;
      if (!key) return null;
      return renderedVerticesData[key]?.position;
    },
    vertexPosition => {
      if (!vertexPosition || !pressStartCoordinates.value) return;
      if (
        distanceBetweenVectors(
          animatedVectorCoordinatesToVector(vertexPosition),
          absoluteCoordinatesToCanvasCoordinates(
            pressStartCoordinates.value,
            {
              x: transform.translateX.value,
              y: transform.translateY.value
            },
            transform.scale.value
          )
        ) >
        vertexRadius + PRESS_SLOP
      ) {
        pressStartCoordinates.value = null;
        pressedVertexKey.value = null;
        return;
      }
    },
    [renderedVerticesData]
  );

  // Press progress updates
  useAnimatedReaction(
    () => pressedVertexKey.value,
    key => {
      if (key) {
        pressProgress.value = withDelay(
          LONG_PRESS_DELAY,
          withTiming(LONG_PRESS_MAX_SCALE, {
            duration: LONG_PRESS_DURATION - LONG_PRESS_DELAY,
            easing: EASING.easeOut
          })
        );
      } else if (!wasShortPress.value) {
        pressProgress.value = withTiming(1, { duration: PULSE_DURATION / 2 });
      }
    }
  );

  // Pressed vertex scale updates
  useAnimatedReaction(
    () => ({
      progress: pressProgress.value,
      vertexData: previousPressedVertexKey.value
        ? renderedVerticesData[previousPressedVertexKey.value]
        : null
    }),
    ({ progress, vertexData }) => {
      if (!vertexData) return;
      vertexData.scale.value = progress;
    },
    [renderedVerticesData]
  );

  useEffect(() => {
    const observer: PressGesturesObserver = {
      onLongPress: handleLongPress,
      onPress: handlePress,
      onPressIn: handlePressIn,
      onPressOut: handlePressOut
    };
    pressGesturesObserver.value = observer;
  }, []);

  return <>{children}</>;
}

export default withGraphData(
  VertexPressEventsProvider,
  ({ renderedVerticesData }) => ({
    renderedVerticesData
  })
);

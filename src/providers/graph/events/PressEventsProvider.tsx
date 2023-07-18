import { Vector } from '@shopify/react-native-skia';
import { PropsWithChildren, useEffect } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { HIT_SLOP, PRESS_SLOP } from '@/constants/events';
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

export type PressEventsProviderProps = PropsWithChildren<{
  pressGesturesObserver: SharedValue<PressGesturesObserver | null>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphEventsSettings;
  transform: AnimatedCanvasTransform;
  vertexRadius: number;
}>;

function PressEventsProvider({
  children,
  pressGesturesObserver,
  renderedVerticesData,
  settings,
  transform,
  vertexRadius
}: PressEventsProviderProps) {
  const pressStartCoordinates = useSharedValue<Vector | null>(null);
  const pressedVertexKey = useSharedValue<null | string>(null);

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
      pressedVertexKey.value = findPressedVertex(
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
  PressEventsProvider,
  ({ renderedVerticesData }) => ({
    renderedVerticesData
  })
);

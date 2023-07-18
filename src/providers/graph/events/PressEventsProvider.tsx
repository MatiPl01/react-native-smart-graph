import { PropsWithChildren, useEffect } from 'react';
import { SharedValue, useWorkletCallback } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph/data';
import { AnimatedCanvasTransform } from '@/types/canvas';
import {
  VertexComponentData,
  VertexComponentRenderData
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { PressGesturesObserver } from '@/types/gestures';
import { GraphEventsSettings } from '@/types/settings';

export type PressEventsProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<{
  pressGesturesObserver: SharedValue<PressGesturesObserver | null>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphEventsSettings<V, E, ED>;
  transform: AnimatedCanvasTransform;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function PressEventsProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({ children, pressGesturesObserver }: PressEventsProviderProps<V, E, ED>) {
  const handlePressIn = useWorkletCallback(() => {
    console.log('handlePressIn');
  }, []);

  const handlePressOut = useWorkletCallback(() => {
    console.log('handlePressOut');
  }, []);

  const handlePress = useWorkletCallback(() => {
    console.log('handlePress');
  }, []);

  const handleLongPress = useWorkletCallback(() => {
    console.log('handleLongPress');
  }, []);

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
  ({ renderedVerticesData, verticesData }) => ({
    renderedVerticesData,
    verticesData
  })
);

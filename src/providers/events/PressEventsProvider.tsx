import { memo, PropsWithChildren, useEffect } from 'react';
import { Pressable } from 'react-native';
// eslint-disable-next-line import/default
import Animated, {
  SharedValue,
  useAnimatedStyle
} from 'react-native-reanimated';

import { withGraphData } from '@/providers/data';
import { VertexComponentRenderData } from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import {
  AnimatedBoundingRect,
  AnimatedVectorCoordinates
} from '@/types/layout';
import { GraphSettingsWithDefaults } from '@/types/settings';
import { VertexPressHandler } from '@/types/settings/graph/events';

export type PressEventsProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<{
  boundingRect: AnimatedBoundingRect;
  renderLayer: (zIndex: number, layer: JSX.Element) => void;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphSettingsWithDefaults<V, E, ED>;
}>;

function PressEventsProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  boundingRect,
  children,
  renderLayer,
  renderedVerticesData,
  settings: { events }
}: PressEventsProviderProps<V, E, ED>) {
  useEffect(() => {
    renderLayer(
      1,
      <>
        {(events?.onVertexPress || events?.onVertexLongPress) &&
          Object.entries(renderedVerticesData).map(
            ([key, { currentRadius, position }]) => (
              <VertexOverlay
                boundingRect={boundingRect}
                key={key}
                onLongPress={events?.onVertexLongPress}
                onPress={events?.onVertexPress}
                position={position}
                radius={currentRadius}
              />
            )
          )}
      </>
    );
  }, [renderedVerticesData, events?.onVertexPress, events?.onVertexLongPress]);

  return <>{children}</>;
}

type VertexOverlayProps<V> = {
  boundingRect: AnimatedBoundingRect;
  onLongPress?: VertexPressHandler<V>;
  onPress?: VertexPressHandler<V>;
  position: AnimatedVectorCoordinates;
  radius: SharedValue<number>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function VertexOverlay$<V>({
  boundingRect,
  onLongPress,
  onPress,
  position,
  radius
}: VertexOverlayProps<V>) {
  const style = useAnimatedStyle(() => {
    return {
      height: 2 * radius.value,
      transform: [
        { translateX: position.x.value },
        { translateY: position.y.value }
      ],
      width: 2 * radius.value
    };
  }, [position.x, position.y, radius]);

  const handlePress = () => {
    // TODO
    console.log('handlePress');
  };

  const handleLongPress = () => {
    // TODO
    console.log('handleLongPress');
  };

  return (
    <AnimatedPressable
      onLongPress={handleLongPress}
      onPress={handlePress}
      style={[{ backgroundColor: 'red' }, style]}
    />
  );
}

const VertexOverlay = memo(VertexOverlay$) as typeof VertexOverlay$;

export default withGraphData(
  PressEventsProvider,
  ({ renderedVerticesData }) => ({
    renderedVerticesData
  })
);

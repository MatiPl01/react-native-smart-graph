import React, { PropsWithChildren } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle
} from 'react-native-reanimated';

type SharedBoxProps = ViewProps &
  PropsWithChildren<{
    height?: SharedValue<number>;
    opacity?: SharedValue<number>;
    rotation?: SharedValue<number>;
    scale?: SharedValue<number>;
    width?: SharedValue<number>;
  }>;

type BoxProps = PropsWithChildren<
  SharedBoxProps &
    (
      | {
          position?: SharedValue<{
            x: number;
            y: number;
          }>;
        }
      | { x?: SharedValue<number>; y?: SharedValue<number> }
    )
>;

type InternalBoxProps = SharedBoxProps & {
  position?: SharedValue<{
    x: number;
    y: number;
  }>;
  x?: SharedValue<number>;
  y?: SharedValue<number>;
};

function Box({
  children,
  height,
  opacity,
  position,
  rotation,
  scale,
  style,
  width,
  x,
  y,
  ...viewProps
}: InternalBoxProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    height: height?.value,
    opacity: opacity?.value,
    transform: [
      { translateX: position?.value.x ?? x?.value ?? 0 },
      { translateY: position?.value.y ?? y?.value ?? 0 },
      { rotate: `${rotation?.value ?? 0}rad` },
      { scale: scale?.value ?? 1 }
    ],
    width: width?.value
  }));

  return (
    <Animated.View {...viewProps} style={[styles.box, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute'
  }
});

export default Box as React.FC<BoxProps>;

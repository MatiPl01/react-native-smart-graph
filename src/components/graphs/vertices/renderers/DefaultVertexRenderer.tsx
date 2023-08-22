import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle
} from 'react-native-reanimated';

import { VertexRendererProps } from '@/types/components';

const D = 40;
const R = D / 2;

export default function DefaultVertexRenderer<V>({
  animationProgress,
  currentRadius,
  focusProgress,
  key,
  radius,
  scale
}: VertexRendererProps<V>) {
  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusProgress.value, [0, 1], [0.5, 1]),
    transform: [{ scale: currentRadius.value / R }]
  }));

  useAnimatedReaction(
    () => ({
      currentProgress: animationProgress.value,
      currentScale: scale.value,
      r: radius.value
    }),
    ({ currentProgress, currentScale, r }) => {
      currentRadius.value = currentProgress * currentScale * r;
    }
  );

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.innerCircle} />
      <Text style={styles.textStyle}>{key}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'gold',
    borderRadius: R,
    height: D,
    justifyContent: 'center',
    width: D
  },
  innerCircle: {
    backgroundColor: 'black',
    borderRadius: R,
    height: 0.75 * D,
    width: 0.75 * D
  },
  textStyle: {
    bottom: -(1.25 * R),
    color: 'white',
    fontWeight: 'bold',
    position: 'absolute'
  }
});

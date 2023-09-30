import FONTS from '@/assets/fonts';
import { ResponsiveText } from '@/components';
import { Canvas, useFont } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { TextHorizontalAlignment, TextVerticalAlignment } from '..';

export default function ResponsiveTextExample() {
  const width = 200; //Dimensions.get('window').width;
  const height = 200;
  const text =
    'Omnis ex vero et minima. Sed sed dolor et ut. Quos fugit sed maiores corporis.';
  const fontSize = 20;
  const color = 'white';
  const backgroundColor = '#003d12';
  const lineHeight = 35;

  // Wrapping & clipping
  const numberOfLines = 3;
  const ellipsizeMode = 'tail';

  // Alignment
  const horizontalAlignment = useSharedValue<TextHorizontalAlignment>('center');
  const verticalAlignment = useSharedValue<TextVerticalAlignment>('center');
  const animationProgress = useSharedValue(0);

  const font = useFont(FONTS.rubikFont, fontSize);

  const animatedTextStyle = useAnimatedStyle(() => {
    let textAlign = horizontalAlignment.value;
    if (textAlign === 'center-left' || textAlign === 'center-right') {
      textAlign = 'center';
    }

    return {
      textAlign
    };
  });

  useEffect(() => {
    const horizontalAlignments: Array<TextHorizontalAlignment> = [
      'center-left',
      'center-right'
    ];
    const verticalAlignments: Array<TextVerticalAlignment> = [
      'top',
      'center',
      'bottom'
    ];

    let index = 0;
    setInterval(() => {
      horizontalAlignment.value = horizontalAlignments[index]!;
      verticalAlignment.value = verticalAlignments[index]!;
      index = (index + 1) % horizontalAlignments.length;

      animationProgress.value = 0;
      animationProgress.value = withTiming(1, {
        duration: 2000
      });
    }, 1000);
  }, []);

  if (!font) {
    return null;
  }

  return (
    <>
      <Canvas style={styles.container}>
        <ResponsiveText
          animationProgress={animationProgress}
          backgroundColor={backgroundColor}
          color={color}
          ellipsizeMode={ellipsizeMode}
          font={font}
          height={height}
          horizontalAlignment={horizontalAlignment}
          lineHeight={lineHeight}
          numberOfLines={numberOfLines}
          text={text}
          verticalAlignment={verticalAlignment}
          width={width}
          x={0}
          y={100 + fontSize}
        />
      </Canvas>
      <View style={styles.container}>
        <Animated.Text
          ellipsizeMode={ellipsizeMode}
          numberOfLines={numberOfLines}
          style={[
            {
              fontSize,
              backgroundColor,
              width,
              color,
              height,
              lineHeight
            },
            animatedTextStyle
          ]}>
          {text}
        </Animated.Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  }
});

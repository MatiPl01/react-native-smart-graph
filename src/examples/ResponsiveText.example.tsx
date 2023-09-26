import FONTS from '@/assets/fonts';
import { ResponsiveText } from '@/components';
import { Canvas, useFont } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';

export default function ResponsiveTextExample() {
  const width = 200; //Dimensions.get('window').width;
  const height = 200;
  const text =
    'Modi id maiores est longwordtest iste porro et in ipsam dolores.';
  const fontSize = 20;
  const color = 'white';
  const backgroundColor = '#003d12';
  const lineHeight = 35;

  // Wrapping & clipping
  const numberOfLines = 3;
  const ellipsizeMode = 'tail';

  // Alignment
  const horizontalAlignment = 'center';
  const verticalAlignment = 'center';

  const font = useFont(FONTS.rubikFont, fontSize);

  if (!font) {
    return null;
  }

  return (
    <>
      <Canvas style={styles.container}>
        <ResponsiveText
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
        <Text
          ellipsizeMode={ellipsizeMode}
          numberOfLines={numberOfLines}
          style={{
            fontSize,
            backgroundColor,
            width,
            color,
            height,
            textAlign: horizontalAlignment,
            lineHeight
          }}>
          {text}
        </Text>
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

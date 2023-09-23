import FONTS from '@/assets/fonts';
import { ResponsiveText } from '@/components/text';
import { Canvas, useFont } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';

export default function ResponsiveTextExample() {
  const width = 100;
  const text = 'test test test test test test test';
  const fontSize = 20;
  const color = 'white';

  const font = useFont(FONTS.rubikFont, fontSize);

  if (!font) {
    return null;
  }

  return (
    <>
      <Canvas style={styles.container}>
        <ResponsiveText
          color={color}
          font={font}
          text={text}
          width={width}
          x={0}
          y={20}
        />
      </Canvas>
      <View style={styles.container}>
        <Text style={{ fontSize, backgroundColor: 'red', width, color }}>
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

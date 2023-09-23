import FONTS from '@/assets/fonts';
import { ResponsiveText } from '@/components/text';
import { Canvas, useFont } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';

export default function ResponsiveTextExample() {
  const width = 200; //Dimensions.get('window').width;
  const text = 'Modi id maiores est iste porro et in ipsam dolores.';
  const fontSize = 20;
  const color = 'white';
  const numberOfLines = 2;

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
          numberOfLines={numberOfLines}
          text={text}
          width={width}
          x={0}
          y={fontSize}
        />
      </Canvas>
      <View style={styles.container}>
        <Text
          numberOfLines={numberOfLines}
          style={{ fontSize, backgroundColor: 'red', width, color }}>
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

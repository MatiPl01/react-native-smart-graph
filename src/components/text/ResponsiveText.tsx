import {
  Group,
  Rect,
  SkFont,
  Text,
  TextProps
} from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { EllipsizeMode, TextLine } from '@/types/components';
import { HorizontalAlignment } from '@/types/layout';
import { alignText, wrapText } from '@/utils/text';

type ResponsiveTextProps = Omit<TextProps, 'font'> & {
  backgroundColor?: string;
  ellipsizeMode?: EllipsizeMode;
  font: SkFont;
  height?: number;
  numberOfLines?: number;
  textAlign?: HorizontalAlignment;
  width?: number;
};

export default function ResponsiveText({
  backgroundColor,
  ellipsizeMode,
  font,
  height,
  numberOfLines,
  text,
  textAlign,
  width = Infinity,
  x,
  y,
  ...rest
}: ResponsiveTextProps) {
  const fontSize = useMemo(() => font.getSize(), [font]);
  const textLines = useMemo<Array<TextLine>>(
    () => wrapText(text, font, width, numberOfLines, ellipsizeMode),
    [text, font, width, numberOfLines, ellipsizeMode]
  );
  const alignedTextLines = useMemo(
    () => alignText(textLines, width, textAlign),
    [textLines, textAlign]
  );

  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      {backgroundColor && (
        <Rect
          color={backgroundColor}
          height={height ?? textLines.length * fontSize}
          width={width}
        />
      )}
      {alignedTextLines.map((line, i) => (
        <Text
          key={i}
          {...rest}
          font={font}
          text={line.text}
          x={line.offset}
          y={(i + 1) * fontSize}
        />
      ))}
    </Group>
  );
}

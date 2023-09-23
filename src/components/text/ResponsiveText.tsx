import { Rect, SkFont, Text, TextProps } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { EllipsizeMode } from '@/types/components';
import { HorizontalAlignment, VerticalAlignment } from '@/types/layout';
import { wrapText } from '@/utils/text';

type ResponsiveTextProps = Omit<TextProps, 'font'> & {
  ellipsizeMode?: EllipsizeMode;
  font: SkFont;
  horizontalAlignment?: HorizontalAlignment;
  numberOfLines?: number;
  verticalAlignment?: VerticalAlignment;
  width?: number;
};

export default function ResponsiveText({
  ellipsizeMode,
  font,
  numberOfLines,
  text,
  width = Infinity,
  y,
  ...rest
}: ResponsiveTextProps) {
  const fontSize = useMemo(() => font.getSize(), [font]);
  const textLines = useMemo<Array<TextLine>>(
    () => wrapText(text, font, width, numberOfLines, ellipsizeMode),
    [text, font]
  );

  return (
    <>
      <Rect
        color='red'
        height={textLines.length * fontSize}
        width={width}
        x={0}
        y={100}
      />
      {textLines.map((line, i) => (
        <Text
          key={i}
          {...rest}
          font={font}
          text={line.text}
          y={y + i * fontSize}
        />
      ))}
    </>
  );
}

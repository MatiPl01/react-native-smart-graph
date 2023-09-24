import {
  Group,
  Rect,
  SkFont,
  Text,
  TextProps
} from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { EllipsizeMode, TextLine } from '@/types/components';
import { HorizontalAlignment, VerticalAlignment } from '@/types/layout';
import { alignText, getVerticalAlignmentOffset, wrapText } from '@/utils/text';

type ResponsiveTextProps = Omit<TextProps, 'font'> & {
  backgroundColor?: string;
  ellipsizeMode?: EllipsizeMode;
  font: SkFont;
  height?: number;
  horizontalAlignment?: HorizontalAlignment;
  lineHeight?: number;
  numberOfLines?: number;
  verticalAlignment?: VerticalAlignment;
  width?: number;
};

export default function ResponsiveText({
  backgroundColor,
  ellipsizeMode,
  font,
  height,
  horizontalAlignment,
  lineHeight,
  numberOfLines,
  text,
  verticalAlignment,
  width = Infinity,
  x,
  y,
  ...rest
}: ResponsiveTextProps) {
  const fontSize = font.getSize();
  const resultingLineHeight = lineHeight ?? fontSize;
  const textLines = useMemo<Array<TextLine>>(
    () => wrapText(text, font, width, numberOfLines, ellipsizeMode),
    [text, font, width, numberOfLines, ellipsizeMode]
  );
  const alignedTextLines = useMemo(
    () => alignText(textLines, width, horizontalAlignment),
    [textLines, horizontalAlignment]
  );
  const verticalAlignmentOffset = getVerticalAlignmentOffset(
    textLines.length * resultingLineHeight -
      (resultingLineHeight - 1.5 * fontSize),
    height ?? 0,
    verticalAlignment
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
          y={verticalAlignmentOffset + i * resultingLineHeight + fontSize}
        />
      ))}
    </Group>
  );
}

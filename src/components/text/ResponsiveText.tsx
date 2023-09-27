import {
  Group,
  Rect,
  SkFont,
  Text,
  TextProps
} from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';

import { EllipsizeMode, TextLine } from '@/types/components';
import { HorizontalAlignment, VerticalAlignment } from '@/types/layout';
import { PartialBy } from '@/types/utils';
import { alignText, getVerticalAlignmentOffset, wrapText } from '@/utils/text';

type ResponsiveTextProps = PartialBy<Omit<TextProps, 'font'>, 'x' | 'y'> & {
  backgroundColor?: string;
  ellipsizeMode?: EllipsizeMode;
  font: SkFont;
  height?: number;
  horizontalAlignment?: HorizontalAlignment;
  lineHeight?: number;
  numberOfLines?: number;
  onMeasure?: (width: number, height: number) => void;
  verticalAlignment?: VerticalAlignment;
  width?: number;
};

export default function ResponsiveText({
  backgroundColor,
  ellipsizeMode,
  font,
  height = 0,
  horizontalAlignment,
  lineHeight,
  numberOfLines,
  onMeasure,
  text,
  verticalAlignment,
  width = 0,
  x = 0,
  y = 0,
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
  const textHeight =
    textLines.length * resultingLineHeight -
    (resultingLineHeight - 1.5 * fontSize);
  const verticalAlignmentOffset = getVerticalAlignmentOffset(
    textHeight,
    height,
    verticalAlignment
  );

  useEffect(() => {
    if (!onMeasure) return;
    const textWidth = alignedTextLines.reduce(
      (acc, line) => Math.max(acc, line.width),
      0
    );
    onMeasure(textWidth, textHeight);
  }, [alignedTextLines, onMeasure]);

  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      {backgroundColor && (
        <Rect
          color={backgroundColor}
          height={height}
          width={width}
          y={verticalAlignmentOffset}
        />
      )}
      {alignedTextLines.map((line, i) => (
        <Text
          {...rest}
          font={font}
          key={i}
          text={line.text}
          x={line.offset}
          y={verticalAlignmentOffset + i * resultingLineHeight + fontSize}
        />
      ))}
    </Group>
  );
}

import { AlignedTextLine, TextLine } from '@/types/components';
import { HorizontalAlignment } from '@/types/layout';

const alignTextLeft = (lines: Array<TextLine>): Array<AlignedTextLine> =>
  lines.map(line => ({
    ...line,
    offset: 0
  }));

const alignTextRight = (
  lines: Array<TextLine>,
  width: number
): Array<AlignedTextLine> =>
  lines.map(line => ({
    ...line,
    offset: width - line.width
  }));

const alignTextCenter = (
  lines: Array<TextLine>,
  width: number
): Array<AlignedTextLine> =>
  lines.map(line => ({
    ...line,
    offset: (width - line.width) / 2
  }));

export const alignText = (
  lines: Array<TextLine>,
  width: number,
  alignment: HorizontalAlignment = 'left'
): Array<AlignedTextLine> => {
  switch (alignment) {
    case 'right':
      return alignTextRight(lines, width);
    case 'center':
      return alignTextCenter(lines, width);
    default:
      return alignTextLeft(lines);
  }
};

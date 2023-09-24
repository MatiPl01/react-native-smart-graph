import { AlignedTextLine, TextLine } from '@/types/components';
import { HorizontalAlignment, VerticalAlignment } from '@/types/layout';

export const alignText = (
  lines: Array<TextLine>,
  width: number,
  alignment: HorizontalAlignment = 'left'
): Array<AlignedTextLine> => {
  switch (alignment) {
    case 'right':
      return lines.map(line => ({
        ...line,
        offset: width - line.width
      }));
    case 'center':
      return lines.map(line => ({
        ...line,
        offset: (width - line.width) / 2
      }));
    case 'left':
      return lines.map(line => ({
        ...line,
        offset: 0
      }));
  }
};

export const getVerticalAlignmentOffset = (
  componentHeight: number,
  parentHeight = 0,
  verticalAlignment: VerticalAlignment = 'top'
): number => {
  switch (verticalAlignment) {
    case 'top':
      return 0;
    case 'bottom':
      return parentHeight - componentHeight;
    case 'center':
      return (parentHeight - componentHeight) / 2;
  }
};

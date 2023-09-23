/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SkFont } from '@shopify/react-native-skia';

import { EllipsizeMode, TextLine } from '@/types/components';

const getTextChunks = (text: string): Array<string> =>
  text.split(/(\s+(?=\S))/g).filter(word => word.length > 0);

const isSpace = (text: string): boolean => text.trim().length === 0;

export const wrapText = (
  text: string,
  font: SkFont,
  width?: number,
  numberOfLines?: number,
  ellipsizeMode?: EllipsizeMode
): Array<TextLine> => {
  const textChunks = getTextChunks(text);

  const result: Array<TextLine> = [];

  if (width !== undefined) {
    let currentLine: { chunks: Array<string>; width: number } = {
      chunks: [],
      width: 0
    };
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i]!;
      const chunkWidth = font.getTextWidth(chunk);

      if (currentLine.chunks.length || !isSpace(chunk)) {
        currentLine.chunks.push(chunk);
        currentLine.width += chunkWidth;
      }

      if (
        currentLine.width + chunkWidth >= width ||
        i === textChunks.length - 1
      ) {
        result.push({
          text: currentLine.chunks.join(''),
          width: currentLine.width
        });
        currentLine = { chunks: [], width: 0 };
      }
    }
  }

  return result;
};

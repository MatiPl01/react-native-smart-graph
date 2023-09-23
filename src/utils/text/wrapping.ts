/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SkFont } from '@shopify/react-native-skia';

import { EllipsizeMode, TextLine } from '@/types/components';

const ELLIPSIS = '...';

const getTextChunks = (text: string): Array<string> =>
  text.split(/(\s+(?=\S))/g).filter(word => word.length > 0);

const isSpace = (text: string): boolean => text.trim().length === 0;

const wrapWithoutTrimming = (
  chunks: Array<string>,
  font: SkFont,
  width: number
): Array<TextLine> => {
  const result: Array<TextLine> = [];

  let currentLine: { chunks: Array<string>; width: number } = {
    chunks: [],
    width: 0
  };

  let nextChunkWidth = font.getTextWidth(chunks[0]!);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const chunkWidth = nextChunkWidth;
    const nextChunk = chunks[i + 1];
    nextChunkWidth = nextChunk ? font.getTextWidth(nextChunk) : Infinity;

    if (currentLine.chunks.length || !isSpace(chunk)) {
      currentLine.chunks.push(chunk);
      currentLine.width += chunkWidth;
    }

    if (currentLine.width + nextChunkWidth >= width) {
      result.push({
        text: currentLine.chunks.join(''),
        width: currentLine.width
      });
      currentLine = { chunks: [], width: 0 };
    }
  }

  return result;
};

type TrimmedWrapFunction = (
  chunks: Array<string>,
  font: SkFont,
  width: number,
  numberOfLines: number
) => Array<TextLine>;

const wrapWithTrimmedTail: TrimmedWrapFunction = (
  chunks,
  font,
  width,
  numberOfLines
) => {
  const result: Array<TextLine> = [];

  let currentLine: { chunks: Array<string>; width: number } = {
    chunks: [],
    width: 0
  };

  let i = 0;
  let shouldTrim = false;
  let nextChunkWidth = font.getTextWidth(chunks[0]!);

  for (; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const chunkWidth = nextChunkWidth;
    const nextChunk = chunks[i + 1];
    nextChunkWidth = nextChunk ? font.getTextWidth(nextChunk) : Infinity;

    if (currentLine.chunks.length || !isSpace(chunk)) {
      currentLine.chunks.push(chunk);
      currentLine.width += chunkWidth;
    }

    if (currentLine.width + nextChunkWidth >= width) {
      result.push({
        text: currentLine.chunks.join(''),
        width: currentLine.width
      });
      // Break if the last displayed line is reached
      if (result.length === numberOfLines && nextChunkWidth < Infinity) {
        shouldTrim = true;
        break;
      }
      currentLine = { chunks: [], width: 0 };
    }
  }

  const ellipsisWidth = font.getTextWidth(ELLIPSIS);

  if (shouldTrim) {
    let lastLineText = result[result.length - 1]!.text;
    if (i++ < chunks.length) {
      lastLineText += chunks[i]!;
    }

    // Go from the last char and find how many chars must be sliced to
    // display ellipsis at the end
    let lastIndex = lastLineText.length - 1;
    let lineWidth = font.getTextWidth(lastLineText) + ellipsisWidth;

    while (lineWidth > width && lastIndex >= 0) {
      lineWidth -= font.getTextWidth(lastLineText[lastIndex]!);
      lastIndex--;
    }

    result[result.length - 1] = {
      text: `${lastLineText.slice(0, lastIndex)}${ELLIPSIS}`,
      width: lineWidth
    };
  }

  return result;
};

const wrapWithTrimming = (
  chunks: Array<string>,
  font: SkFont,
  width: number,
  numberOfLines: number,
  ellipsizeMode: EllipsizeMode
): Array<TextLine> => {
  switch (ellipsizeMode) {
    case 'tail':
      return wrapWithTrimmedTail(chunks, font, width, numberOfLines);
  }

  return [];
};

export const wrapText = (
  text: string,
  font: SkFont,
  width: number,
  numberOfLines = Infinity,
  ellipsizeMode: EllipsizeMode = 'tail'
): Array<TextLine> => {
  const chunks = getTextChunks(text);

  if (numberOfLines === Infinity) {
    return wrapWithoutTrimming(chunks, font, width);
  }

  return wrapWithTrimming(chunks, font, width, numberOfLines, ellipsizeMode);
};

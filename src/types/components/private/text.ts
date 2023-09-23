export type TextLine = {
  text: string;
  width: number;
};

export type AlignedTextLine = TextLine & {
  offset: number;
};

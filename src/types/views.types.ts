export type Dimensions = {
  width: number;
  height: number;
};

export type ObjectFit = 'contain' | 'cover' | 'none' | number; // defaults to 'none', number is for scale

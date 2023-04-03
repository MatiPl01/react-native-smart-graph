export type Point2D = {
  x: number;
  y: number;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type ObjectFit = 'contain' | 'cover' | 'none' | number; // defaults to 'none', number is for scale

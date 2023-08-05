import { BoundingRect } from './private';

export type VerticalAlignment = 'bottom' | 'center' | 'top';
export type HorizontalAlignment = 'center' | 'left' | 'right';

export type Alignment = {
  horizontalAlignment?: HorizontalAlignment;
  horizontalOffset?: number;
  verticalAlignment?: VerticalAlignment;
  verticalOffset?: number;
};

export type AllSpacing = Partial<BoundingRect>;

export type AxisSpacing = {
  horizontal?: number;
  vertical?: number;
};

export type Spacing = AllSpacing | AxisSpacing | number;

export type ObjectFit = 'contain' | 'cover' | 'none';

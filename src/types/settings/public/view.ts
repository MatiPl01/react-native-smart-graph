import { ObjectFit, Spacing } from '@/types/layout';

export type GraphViewSettings = {
  autoSizingTimeout?: number;
  initialScale?: number;
  objectFit?: ObjectFit;
  padding?: Spacing;
  scales?: Array<number>;
};

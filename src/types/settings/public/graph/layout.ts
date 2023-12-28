import { Animatable } from '@/types/utils';

/*
 * AUTO LAYOUT
 */
export type AutoLayoutSettings = {
  type: 'auto';
};

/*
 * FORCE LAYOUT
 */
export type ForceLayoutSettings = {
  attractionForceFactor?: Animatable<number>;
  attractionScale?: Animatable<number>;
  minUpdateDistance?: Animatable<number>;
  refreshInterval?: Animatable<number>;
  repulsionScale?: Animatable<number>;
  strategy?: 'default'; // TODO - add more in the future
  type: 'force';
};

/*
 * GRAPH LAYOUT SETTINGS
 */
export type GraphLayoutSettings = AutoLayoutSettings | ForceLayoutSettings;

export type LayoutType = GraphLayoutSettings['type'];

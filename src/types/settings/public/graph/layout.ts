import { Sharedifyable } from '@/types/utils';

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
  attractionForceFactor?: Sharedifyable<number>;
  attractionScale?: Sharedifyable<number>;
  minUpdateDistance?: Sharedifyable<number>;
  refreshInterval?: Sharedifyable<number>;
  repulsionScale?: Sharedifyable<number>;
  strategy?: Sharedifyable<'default'>; // TODO - add more in the future
  type: 'force';
};

/*
 * GRAPH LAYOUT SETTINGS
 */
export type GraphLayoutSettings = AutoLayoutSettings | ForceLayoutSettings;

export type LayoutType = GraphLayoutSettings['type'];

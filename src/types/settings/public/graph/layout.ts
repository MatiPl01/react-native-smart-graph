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
  attractionForceFactor?: number;
  attractionScale?: number;
  repulsionScale?: number;
  strategy: 'default';
  type: 'force';
};

/*
 * GRAPH LAYOUT SETTINGS
 */
export type GraphLayoutSettings = AutoLayoutSettings | ForceLayoutSettings;

export type LayoutType = GraphLayoutSettings['type'];

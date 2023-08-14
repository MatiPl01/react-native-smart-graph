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
  minUpdateDistance?: number;
  refreshInterval?: number;
  repulsionScale?: number;
  strategy?: 'default'; // TODO - add more in the future
  type: 'force';
};

/*
 * GRAPH LAYOUT SETTINGS
 */
export type GraphLayoutSettings = AutoLayoutSettings | ForceLayoutSettings;

export type LayoutType = GraphLayoutSettings['type'];

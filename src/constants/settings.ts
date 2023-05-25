export const DEFAULT_FORCES_SETTINGS = {
  forces: {
    attraction: {
      edges: {
        scale: 0.1,
        factor: 3
      },
      targetPositions: { scale: 0.1, factor: 3 }
    },
    repelling: {
      vertices: {
        scale: 100000
      }
    }
  }
};

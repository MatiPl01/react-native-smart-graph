// TODO - improve docs later
import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { Graph, Vertex } from '@/types/graphs';
import {
  GetLayerRadiusFunction,
  GraphLayout,
  OrbitsLayerSizingSettings,
  OrbitsPlacementSettings,
  PlacedVerticesPositions
} from '@/types/settings';
import { findRootVertex, isGraphATree, isGraphDirected } from '@/utils/graphs';

/**
 * The graph must be a tree!
 * Places vertices in a circular fashion. The root vertex is placed in the center of the circle.
 *
 * @param graph
 * @param containerWidth
 * @param containerHeight
 * @returns
 */
const placeVerticesOnOrbits = <V, E>(
  graph: Graph<V, E>,
  vertexRadius: number,
  settings: OrbitsPlacementSettings
): GraphLayout => {
  // TODO - maybe add undirected graph support
  if (!isGraphDirected(graph)) {
    throw new Error('Cannot place vertices on rings for undirected graph');
  }
  if (!isGraphATree(graph)) {
    throw new Error('Cannot place vertices on rings for non-tree graph');
  }

  const {
    minVertexSpacing = SHARED_PLACEMENT_SETTINGS.minVertexSpacing,
    ...layerSizingSettings
  } = settings;

  const verticesLayerPositions: Record<
    string,
    { layer: number; angle: number }
  > = {};
  const minLayersRadius: Record<string, number> = {};

  const rootVertex = findRootVertex(graph) as Vertex<V, E>;
  const minVertexCenterDistance = 2 * vertexRadius + minVertexSpacing;

  placeChildrenOnRingSection(
    rootVertex,
    0,
    0,
    2 * Math.PI,
    minVertexCenterDistance,
    minLayersRadius,
    verticesLayerPositions
  );

  const { width, height, layersRadius } = getLayout(
    minLayersRadius,
    minVertexSpacing,
    vertexRadius,
    layerSizingSettings
  );

  return {
    width,
    height,
    verticesPositions: Object.entries(verticesLayerPositions).reduce(
      (acc, [key, { layer, angle }]) => {
        const r = layersRadius[layer] as number;
        acc[key] = {
          x: r * Math.cos(angle),
          y: r * Math.sin(angle)
        };
        return acc;
      },
      {} as PlacedVerticesPositions
    )
  };
};

const placeChildrenOnRingSection = <V, E>(
  parent: Vertex<V, E>,
  parentLayer: number,
  parentAngle: number,
  sectionAngle: number,
  minVertexCenterDistance: number,
  minLayersRadius: Record<string, number>,
  verticesLayerPositions: Record<string, { layer: number; angle: number }>
) => {
  if (parentLayer > 0) {
    const denominator = 2 * Math.sin(sectionAngle / 2);
    const sectionRadius =
      denominator > 1e-10
        ? minVertexCenterDistance / denominator
        : minVertexCenterDistance;

    minLayersRadius[parentLayer] = Math.max(
      minLayersRadius[parentLayer] || 0,
      sectionRadius,
      minVertexCenterDistance
    );
  } else {
    minLayersRadius[parentLayer] = 0;
  }

  verticesLayerPositions[parent.key] = {
    layer: parentLayer,
    angle: parentAngle
  };

  parent.neighbors.forEach((child, i) => {
    placeChildrenOnRingSection(
      child,
      parentLayer + 1,
      parentAngle -
        sectionAngle / 2 +
        (sectionAngle / parent.neighbors.length) * (i + 0.5),
      sectionAngle / parent.neighbors.length,
      minVertexCenterDistance,
      minLayersRadius,
      verticesLayerPositions
    );
  });
};

const getEqualLayersRadius = (
  minLayersRadius: Record<string, number>
): Array<number> => {
  const layersCount = Object.keys(minLayersRadius).length;

  const lastLayerRadius = Object.entries(minLayersRadius).reduce(
    (acc, [layerNumber, minLayerRadius]) => {
      if (layerNumber === '0') {
        return 0;
      }
      return Math.max(acc, (minLayerRadius / +layerNumber) * layersCount);
    },
    0
  );

  const layersRadius = [];

  for (let i = 0; i < layersCount; i++) {
    layersRadius.push((lastLayerRadius / layersCount) * i);
  }

  return layersRadius;
};

const getQuadIncreasingLayersRadius = (
  minLayersRadius: Record<string, number>
): Array<number> => {
  const maxCoefficient = Object.entries(minLayersRadius).reduce(
    (acc, [layerNumber, minLayerRadius]) => {
      if (layerNumber === '0') {
        return 0;
      }
      return Math.max(acc, minLayerRadius / (+layerNumber) ** 2);
    },
    0
  );

  return Object.keys(minLayersRadius).map(
    layerNumber => maxCoefficient * (+layerNumber) ** 2
  );
};

const getNonDecreasingLayersRadius = (
  minLayersRadius: Record<string, number>,
  minVertexSpacing: number,
  vertexRadius: number
): Array<number> => {
  const layersRadius = [0];
  let maxDistanceBetweenLayers = minVertexSpacing + 2 * vertexRadius;

  for (let i = 1; i < Object.keys(minLayersRadius).length; i++) {
    layersRadius.push(
      Math.max(
        (layersRadius[i - 1] as number) + maxDistanceBetweenLayers,
        minLayersRadius[i] as number
      )
    );

    maxDistanceBetweenLayers = Math.max(
      maxDistanceBetweenLayers,
      (layersRadius[i] as number) - (layersRadius[i - 1] as number)
    );
  }

  return layersRadius;
};

const getCustomLayersRadius = (
  layersCount: number,
  getLayerRadius: GetLayerRadiusFunction
): Array<number> => {
  const layersRadius = [0];

  for (let i = 1; i < layersCount; i++) {
    layersRadius.push(
      getLayerRadius({
        layerIndex: i,
        layersCount,
        previousLayerRadius: layersRadius[i - 1] as number
      })
    );
  }

  return layersRadius;
};

const getAutoLayersRadius = (
  minLayersRadius: Record<string, number>,
  minVertexSpacing: number,
  vertexRadius: number
): Array<number> => {
  const layersRadius = [0];

  for (let i = 1; i < Object.keys(minLayersRadius).length; i++) {
    layersRadius.push(
      Math.max(
        minLayersRadius[i] as number,
        (layersRadius[i - 1] as number) + minVertexSpacing + 2 * vertexRadius
      )
    );
  }

  return layersRadius;
};

const getLayersRadius = (
  minLayersRadius: Record<string, number>,
  minVertexSpacing: number,
  vertexRadius: number,
  layerSizingSettings: OrbitsLayerSizingSettings
): Array<number> => {
  switch (layerSizingSettings.layerSizing) {
    case 'equal':
      return getEqualLayersRadius(minLayersRadius);
    case 'quad-increasing':
      return getQuadIncreasingLayersRadius(minLayersRadius);
    case 'non-decreasing':
      return getNonDecreasingLayersRadius(
        minLayersRadius,
        minVertexSpacing,
        vertexRadius
      );
    case 'custom':
      return getCustomLayersRadius(
        Object.keys(minLayersRadius).length,
        layerSizingSettings.getLayerRadius
      );
    case 'auto':
    default:
      return getAutoLayersRadius(
        minLayersRadius,
        minVertexSpacing,
        vertexRadius
      );
  }
};

const getLayout = (
  minLayersRadius: Record<string, number>,
  minVertexSpacing: number,
  vertexRadius: number,
  layerSizingSettings: OrbitsLayerSizingSettings
) => {
  const layersRadius = getLayersRadius(
    minLayersRadius,
    minVertexSpacing,
    vertexRadius,
    layerSizingSettings
  );

  const containerSize =
    2 * ((layersRadius[layersRadius.length - 1] as number) + vertexRadius);

  return {
    width: containerSize,
    height: containerSize,
    layersRadius
  };
};

export default placeVerticesOnOrbits;

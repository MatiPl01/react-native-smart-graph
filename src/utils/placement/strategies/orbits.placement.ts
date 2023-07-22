/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SHARED_PLACEMENT_SETTINGS } from '@/constants/placement';
import { GraphConnections } from '@/types/graphs';
import {
  GetLayerRadiusFunction,
  GraphLayout,
  OrbitsLayerSizingSettings,
  OrbitsPlacementSettings,
  PlacedVerticesPositions
} from '@/types/settings';
import { bfs, findGraphComponents, findRootVertex } from '@/utils/algorithms';
import {
  arrangeGraphComponents,
  calcContainerBoundingRect,
  Symmetry
} from '@/utils/placement/shared';

type ArrangedVertices = Record<
  string,
  { angle: number; layer: number; sectorAngle: number }
>;

const getEqualLayerRadiuses = (
  minLayerRadiuses: Record<string, number>
): Array<number> => {
  'worklet';
  const layersCount = Object.keys(minLayerRadiuses).length;

  const lastLayerRadius = Object.entries(minLayerRadiuses).reduce(
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

const getQuadIncreasingLayerRadiuses = (
  minLayerRadiuses: Record<string, number>
): Array<number> => {
  'worklet';
  const maxCoefficient = Object.entries(minLayerRadiuses).reduce(
    (acc, [layerNumber, minLayerRadius]) => {
      if (layerNumber === '0') {
        return 0;
      }
      return Math.max(acc, minLayerRadius / (+layerNumber) ** 2);
    },
    0
  );

  return Object.keys(minLayerRadiuses).map(
    layerNumber => maxCoefficient * (+layerNumber) ** 2
  );
};

const getNonDecreasingLayerRadiuses = (
  minLayerRadiuses: Record<string, number>,
  minVertexSpacing: number,
  vertexRadius: number
): Array<number> => {
  'worklet';
  const layersRadius = [0];
  let maxDistanceBetweenLayers = minVertexSpacing + 2 * vertexRadius;

  for (let i = 1; i < Object.keys(minLayerRadiuses).length; i++) {
    layersRadius.push(
      Math.max(
        (layersRadius[i - 1] as number) + maxDistanceBetweenLayers,
        minLayerRadiuses[i] as number
      )
    );

    maxDistanceBetweenLayers = Math.max(
      maxDistanceBetweenLayers,
      (layersRadius[i] as number) - (layersRadius[i - 1] as number)
    );
  }

  return layersRadius;
};

const getCustomLayerRadiuses = (
  layersCount: number,
  getLayerRadius: GetLayerRadiusFunction
): Array<number> => {
  'worklet';
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

const getAutoLayerRadiuses = (
  minLayerRadiuses: Record<string, number>,
  minVertexSpacing: number,
  vertexRadius: number
): Array<number> => {
  'worklet';
  const layersRadius = [0];

  for (let i = 1; i < Object.keys(minLayerRadiuses).length; i++) {
    layersRadius.push(
      Math.max(
        minLayerRadiuses[i] as number,
        (layersRadius[i - 1] as number) + minVertexSpacing + 2 * vertexRadius
      )
    );
  }

  return layersRadius;
};

const getLayerRadiuses = (
  minLayerRadiuses: Record<string, number>,
  minVertexSpacing: number,
  vertexRadius: number,
  layerSizingSettings: OrbitsLayerSizingSettings
): Array<number> => {
  'worklet';
  switch (layerSizingSettings.layerSizing) {
    case 'equal':
      return getEqualLayerRadiuses(minLayerRadiuses);
    case 'quad-increasing':
      return getQuadIncreasingLayerRadiuses(minLayerRadiuses);
    case 'non-decreasing':
      return getNonDecreasingLayerRadiuses(
        minLayerRadiuses,
        minVertexSpacing,
        vertexRadius
      );
    case 'custom':
      return getCustomLayerRadiuses(
        Object.keys(minLayerRadiuses).length,
        layerSizingSettings.getLayerRadius
      );
    case 'auto':
    default:
      return getAutoLayerRadiuses(
        minLayerRadiuses,
        minVertexSpacing,
        vertexRadius
      );
  }
};

const calcVertexCenterDistance = (
  minDistanceBetweenVerticesCenters: number,
  sectorAngle: number
): number => {
  'worklet';
  return minDistanceBetweenVerticesCenters / (2 * Math.sin(sectorAngle / 2));
};

const calcLayerRadiuses = (
  arrangedVertices: ArrangedVertices,
  minVertexSpacing: number,
  vertexRadius: number,
  layerSizingSettings: OrbitsLayerSizingSettings
): Record<number, number> => {
  'worklet';
  // Calc min layer radiuses
  const minLayerRadiuses: Record<number, number> = {};
  const minDistanceBetweenVerticesCenters = 2 * vertexRadius + minVertexSpacing;

  for (const { layer, sectorAngle } of Object.values(arrangedVertices)) {
    minLayerRadiuses[layer] =
      layer &&
      Math.max(
        minLayerRadiuses[layer] ?? minDistanceBetweenVerticesCenters,
        calcVertexCenterDistance(minDistanceBetweenVerticesCenters, sectorAngle)
      );
  }

  // Calc layers radiuses
  return getLayerRadiuses(
    minLayerRadiuses,
    minVertexSpacing,
    vertexRadius,
    layerSizingSettings
  );
};

const placeVertices = (
  arrangedVertices: ArrangedVertices,
  layerRadiuses: Record<number, number>
): PlacedVerticesPositions => {
  'worklet';
  return Object.entries(arrangedVertices).reduce(
    (acc, [key, { angle, layer }]) => {
      const radius = layerRadiuses[layer]!;
      acc[key] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
      return acc;
    },
    {} as PlacedVerticesPositions
  );
};

const arrangeVertices = (
  connections: GraphConnections,
  rootVertex: string
): ArrangedVertices => {
  'worklet';
  const layersAndChildren: Record<
    string,
    { children: Array<string>; layer: number }
  > = {};

  // Use BFS algorithm to traverse the graph and create layers
  bfs(connections, [rootVertex], ({ depth, parent, vertex }) => {
    if (!layersAndChildren[vertex]) {
      layersAndChildren[vertex] = {
        children: [],
        layer: depth
      };
    }
    if (parent) {
      layersAndChildren[parent]!.children.push(vertex);
    }
  });

  // Transform layersAndChildren to arranged vertices
  const arrangedVertices: ArrangedVertices = {
    [rootVertex]: { angle: 0, layer: 0, sectorAngle: 2 * Math.PI }
  };
  for (const [key, { children, layer }] of Object.entries(layersAndChildren)) {
    if (!children.length) {
      continue;
    }
    const vertexArrangedData = arrangedVertices[key]!;
    const childSectorAngle = Math.min(
      Math.PI,
      vertexArrangedData.sectorAngle / children.length
    );
    let childStartAngle =
      vertexArrangedData.angle +
      (childSectorAngle - vertexArrangedData.sectorAngle) / 2;

    for (const child of children) {
      arrangedVertices[child] = {
        angle: childStartAngle,
        layer: layer + 1,
        sectorAngle: childSectorAngle
      };
      childStartAngle += childSectorAngle;
    }
  }

  return arrangedVertices;
};

export default function placeVerticesOnOrbits(
  connections: GraphConnections,
  vertexRadius: number,
  isGraphDirected: boolean,
  settings: OrbitsPlacementSettings
): GraphLayout {
  'worklet';
  const componentsLayouts: Array<GraphLayout> = [];
  const rootVertexKeys = new Set(settings.roots);

  const graphComponents = findGraphComponents(connections);

  for (const component of graphComponents) {
    // Find the root vertex of the component
    const rootVertex = findRootVertex(
      connections,
      component,
      rootVertexKeys,
      isGraphDirected
    );

    // Arrange vertices in sectors
    const arrangedVertices = arrangeVertices(connections, rootVertex);
    // Calculate the layout of the component
    const minVertexSpacing =
      settings.minVertexSpacing ?? SHARED_PLACEMENT_SETTINGS.minVertexSpacing;
    const layerRadiuses = calcLayerRadiuses(
      arrangedVertices,
      minVertexSpacing,
      vertexRadius,
      settings
    );
    // Place vertices on the layout
    const placedVerticesPositions = placeVertices(
      arrangedVertices,
      layerRadiuses
    );
    // Calc container dimensions
    const boundingRect = calcContainerBoundingRect(placedVerticesPositions, {
      padding: vertexRadius,
      symmetry: settings.symmetric === false ? undefined : Symmetry.CENTER
    });
    componentsLayouts.push({
      boundingRect,
      verticesPositions: placedVerticesPositions
    });
  }

  return arrangeGraphComponents(componentsLayouts, vertexRadius);
}

import { Vector } from '@shopify/react-native-skia';

import { EdgeComponentData, VertexComponentData } from '@/types/data';
import {
  AllAnimationSettings,
  PlacedVerticesPositions
} from '@/types/settings';
import { Maybe } from '@/types/utils';

import { animateWithCallback, animateWithoutCallback } from './animations';
import { areVectorsEqual } from './vectors';
import { calcTranslationOnProgress } from './views';

const updateVerticesTransform = <V>(
  verticesData: Record<string, VertexComponentData<V>>,
  verticesPositions: PlacedVerticesPositions,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>,
  firstUpdate = true
): boolean => {
  'worklet';
  for (const [key, vertexData] of Object.entries(verticesData)) {
    // If there is no target position, the vertex must have been removed
    // (it will be transitioned to the center of the canvas - it's initial position)
    const targetPosition = verticesPositions[key] ?? { x: 0, y: 0 };
    if (
      // If vertex is already being transitioned to the target position, don't update it
      areVectorsEqual(targetPosition, vertexData.points.value.target) &&
      vertexData.transformProgress.value > 0
    ) {
      continue;
    }
    // Reset source and target positions to the current position
    // (it prevents animation from jumping when progress is not updated yet)
    const currentPosition = calcTranslationOnProgress(
      vertexData.transformProgress.value,
      vertexData.points.value.source,
      vertexData.points.value.target
    );
    vertexData.points.value = {
      source: currentPosition,
      target: currentPosition
    };
    // Now, we can safely reset the progress
    vertexData.transformProgress.value = 0;

    // Animate vertex to the new target position
    // Now, we can safely set the new target position
    vertexData.points.value = {
      source: currentPosition,
      target: targetPosition
    };
    // Start the animation
    (firstUpdate ? animateWithCallback : animateWithoutCallback)(
      vertexData.transformProgress,
      1,
      layoutAnimationSettings
    );
    firstUpdate = false;
  }
  return firstUpdate;
};

const updateEdgesTransform = <E>(
  edgesData: Record<string, EdgeComponentData<E>>,
  verticesPositions: PlacedVerticesPositions,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>,
  firstUpdate = true
): boolean => {
  'worklet';
  for (const edgeData of Object.values(edgesData)) {
    // If there are no target vertices positions, the edge must have been removed
    // (it will be transitioned with removed vertices to the center of the canvas)
    const v1TargetPosition = verticesPositions[edgeData.v1Key] ?? {
      x: 0,
      y: 0
    };
    const v2TargetPosition = verticesPositions[edgeData.v2Key] ?? {
      x: 0,
      y: 0
    };
    const ordering = edgeData.ordering.value;

    // Check if ordering has changed
    let isOrderingModified = false; // This will be used to update the animation progress
    if (
      ordering.source.edgesCount !== ordering.target.edgesCount ||
      ordering.source.order !== ordering.target.order
    ) {
      // Reset source and target positions to the current position
      // (it ensures that the animation will be executed only once when the ordering changes)
      edgeData.ordering.value = {
        source: ordering.target,
        target: ordering.target
      };
      isOrderingModified = true; // Mark as modified to update the animation progress
    }

    // Check if vertices positions have changed
    let isPositionModified = false; // This will be used to update the animation progress
    if (
      (isOrderingModified &&
        (!areVectorsEqual(
          edgeData.points.value.v1Source,
          edgeData.points.value.v1Target
        ) ||
          !areVectorsEqual(
            edgeData.points.value.v2Source,
            edgeData.points.value.v2Target
          ))) ||
      !areVectorsEqual(v1TargetPosition, edgeData.points.value.v1Target) ||
      !areVectorsEqual(v2TargetPosition, edgeData.points.value.v2Target)
    ) {
      // Reset source and target positions to the current position
      // (it prevents animation from jumping when progress is not updated yet)
      const currentV1Position = calcTranslationOnProgress(
        edgeData.transformProgress.value,
        edgeData.points.value.v1Source,
        edgeData.points.value.v1Target
      );
      const currentV2Position = calcTranslationOnProgress(
        edgeData.transformProgress.value,
        edgeData.points.value.v2Source,
        edgeData.points.value.v2Target
      );
      edgeData.points.value = {
        v1Source: currentV1Position,
        v1Target: currentV1Position,
        v2Source: currentV2Position,
        v2Target: currentV2Position
      };
      isPositionModified = true; // Mark as modified to update the animation progress
    }

    // Don't update the progress if neither position nor ordering has changed
    if (!isPositionModified && !isOrderingModified) {
      continue;
    }
    // Now, we can safely reset the progress
    edgeData.transformProgress.value = 0;

    // Animate the edge to the new target position
    // Now, we can safely set the new target position
    if (isPositionModified) {
      edgeData.points.value = {
        v1Source: edgeData.points.value.v1Target,
        v1Target: v1TargetPosition,
        v2Source: edgeData.points.value.v2Target,
        v2Target: v2TargetPosition
      };
    }
    // Start the animation
    (firstUpdate ? animateWithCallback : animateWithoutCallback)(
      edgeData.transformProgress,
      1,
      layoutAnimationSettings
    );
    firstUpdate = false;
  }
  return firstUpdate;
};

export const updateComponentsTransform = <V, E>(
  verticesData: Record<string, VertexComponentData<V>>,
  edgesData: Record<string, EdgeComponentData<E>>,
  verticesPositions: PlacedVerticesPositions,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  // Update vertices (only these that were moved)
  const isFirstUpdate = updateVerticesTransform(
    verticesData,
    verticesPositions,
    layoutAnimationSettings
  );
  // Update edges (only these that were moved or whose ordering changed)
  updateEdgesTransform(
    edgesData,
    verticesPositions,
    layoutAnimationSettings,
    isFirstUpdate
  );
};

export const udateEdgesOrdering = <E>(
  edgesData: Record<string, EdgeComponentData<E>>,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  for (const edgeData of Object.values(edgesData)) {
    const ordering = edgeData.ordering.value;
    if (
      ordering.source.edgesCount !== ordering.target.edgesCount ||
      ordering.source.order !== ordering.target.order
    ) {
      // Reset source and target positions to the current position
      // (it ensures that the animation will be executed only once when the ordering changes)
      edgeData.ordering.value = {
        source: ordering.target,
        target: ordering.target
      };
      edgeData.transformProgress.value = 0;
      // Start the animation
      animateWithoutCallback(
        edgeData.transformProgress,
        1,
        layoutAnimationSettings
      );
    }
  }
};

const setVertexPosition = <V>(
  vertexData: VertexComponentData<V>,
  position: Vector
): void => {
  'worklet';
  vertexData.points.value = {
    source: position,
    target: position
  };
  vertexData.transformProgress.value = 1;
};

const setEdgePosition = <E>(
  edgeData: EdgeComponentData<E>,
  v1Position: Vector,
  v2Position: Vector
): void => {
  'worklet';
  edgeData.points.value = {
    v1Source: v1Position,
    v1Target: v1Position,
    v2Source: v2Position,
    v2Target: v2Position
  };
};

export const getVertexPosition = <V>(
  vertexData: VertexComponentData<V>
): Vector => {
  'worklet';
  return calcTranslationOnProgress(
    vertexData.transformProgress.value,
    vertexData.points.value.source,
    vertexData.points.value.target
  );
};

export const getVertexTransformation = <V>(
  vertexData: VertexComponentData<V>
): Vector & { scale: number } => {
  'worklet';
  return {
    ...getVertexPosition(vertexData),
    scale: vertexData.scale.value
  };
};

export const getVerticesPositions = <V>(
  verticesData: Record<string, VertexComponentData<V>>
): Record<string, Vector> => {
  'worklet';
  return Object.fromEntries(
    Object.entries(verticesData).map(([key, vertexData]) => [
      key,
      getVertexPosition(vertexData)
    ])
  );
};

export const setVerticesPositions = <V, E>(
  newPositions: Record<string, Vector>,
  verticesData: Record<string, VertexComponentData<V>>,
  edgesData: Record<string, EdgeComponentData<E>>
): void => {
  'worklet';
  const newPositionsEntries = Object.entries(newPositions);
  if (!newPositionsEntries.length) return;
  // Set vertices positions
  for (const [key, position] of newPositionsEntries) {
    const vertexData = verticesData[key];
    if (vertexData) setVertexPosition(vertexData, position);
  }
  // Set edges positions
  for (const edgeData of Object.values(edgesData)) {
    // Skip if none of the vertices has been moved
    let v1Position = newPositions[edgeData.v1Key];
    let v2Position = newPositions[edgeData.v2Key];
    if (!v1Position && !v2Position) continue;
    // Skip if any of the vertices doesn't exist
    const v1Data = verticesData[edgeData.v1Key];
    const v2Data = verticesData[edgeData.v2Key];
    if (!v1Data || !v2Data) continue;
    // Set edge position
    v1Position ??= getVertexPosition(v1Data);
    v2Position ??= getVertexPosition(v2Data);
    setEdgePosition(edgeData, v1Position, v2Position);
  }
};

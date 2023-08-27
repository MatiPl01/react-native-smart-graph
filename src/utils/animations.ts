/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-unused-modules */
import {
  cancelAnimation,
  isSharedValue,
  SharedValue,
  withTiming
} from 'react-native-reanimated';

import { EdgeComponentData, VertexComponentData } from '@/types/data';
import {
  AllAnimationSettings,
  AnimationSettings,
  BatchModificationAnimationSettings,
  GraphModificationAnimationsSettings,
  PlacedVerticesPositions,
  SingleModificationAnimationSettings
} from '@/types/settings';
import { Maybe } from '@/types/utils';

import { areVectorsEqual } from './vectors';
import { calcTranslationOnProgress } from './views';

const animateWithoutCallback = (
  value: SharedValue<number>,
  target: number,
  animationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  if (!animationSettings) {
    value.value = target;
    return;
  }
  const { duration, easing } = animationSettings;
  value.value = withTiming(target, {
    duration,
    easing
  });
};

const updateVerticesTransform = <V>(
  verticesData: Record<string, VertexComponentData<V>>,
  verticesPositions: PlacedVerticesPositions,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  for (const [key, vertexData] of Object.entries(verticesData)) {
    const targetPosition = verticesPositions[key];
    if (
      !targetPosition ||
      // If vertex is already being transitioned to the target position, don't update it
      (areVectorsEqual(targetPosition, vertexData.points.value.target) &&
        vertexData.transformProgress.value > 0)
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
    animateWithoutCallback(
      vertexData.transformProgress,
      1,
      layoutAnimationSettings
    );
  }
};

const updateEdgesTransform = <E>(
  edgesData: Record<string, EdgeComponentData<E>>,
  verticesPositions: PlacedVerticesPositions,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  for (const edgeData of Object.values(edgesData)) {
    const v1TargetPosition = verticesPositions[edgeData.v1Key];
    const v2TargetPosition = verticesPositions[edgeData.v2Key];
    const ordering = edgeData.ordering.value;

    // Check if ordering has changed
    let isOrderingModified = false; // This will be used to update the animation progress
    if (
      ordering.source.edgesCount !== ordering.target.edgesCount ||
      ordering.source.order !== ordering.target.order
    ) {
      console.log('edge ordering modified', edgeData.key);
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
      (v1TargetPosition &&
        v2TargetPosition &&
        (!areVectorsEqual(v1TargetPosition, edgeData.points.value.v1Target) ||
          !areVectorsEqual(v2TargetPosition, edgeData.points.value.v2Target)))
    ) {
      console.log('edge position modified', edgeData.key);
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
        v1Target: v1TargetPosition!,
        v2Source: edgeData.points.value.v2Target,
        v2Target: v2TargetPosition!
      };
    }
    // Start the animation
    animateWithoutCallback(
      edgeData.transformProgress,
      1,
      layoutAnimationSettings
    );
  }
};

export const updateComponentsTransform = <V, E>(
  verticesData: Record<string, VertexComponentData<V>>,
  edgesData: Record<string, EdgeComponentData<E>>,
  verticesPositions: PlacedVerticesPositions,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  // Update vertices (only these that were moved)
  updateVerticesTransform(
    verticesData,
    verticesPositions,
    layoutAnimationSettings
  );
  // Update edges (only these that were moved or whose ordering changed)
  updateEdgesTransform(edgesData, verticesPositions, layoutAnimationSettings);
  // Call fake withTiming if the onComplete callback is provided
  // to ensure that it will be called only once
  if (layoutAnimationSettings?.onComplete) {
    withTiming(0, layoutAnimationSettings);
  }
};

const ANIMATION_SETTINGS_KEYS = new Set(['duration', 'easing', 'onComplete']);

const isAnimationSettingsObject = (obj: object): obj is AnimationSettings =>
  Object.keys(obj).every(key => ANIMATION_SETTINGS_KEYS.has(key));

const BATCH_MODIFICATION_WITH_EDGES_AND_VERTICES_SETTINGS_KEYS = new Set([
  'edges',
  'vertices',
  'layout'
]);

const isBatchModificationSettingsObjectWithEdgesAndVertices = (
  obj: object
): obj is {
  edges: Record<string, AnimationSettings>;
  layout: AnimationSettings;
  vertices: Record<string, AnimationSettings>;
} =>
  Object.keys(obj).every(key =>
    BATCH_MODIFICATION_WITH_EDGES_AND_VERTICES_SETTINGS_KEYS.has(key)
  );

// In functions below onComplete callback is passed only to single animation
// to ensure that it will be called only once

export const createAnimationsSettingsForSingleModification = (
  component: { edge?: string; vertex?: string },
  animationsSettings?: SingleModificationAnimationSettings
): GraphModificationAnimationsSettings => {
  if (!animationsSettings) {
    return {
      edges: {},
      vertices: {}
    };
  }

  if (isAnimationSettingsObject(animationsSettings)) {
    return {
      edges: component.edge
        ? { [component.edge]: { ...animationsSettings, onComplete: undefined } }
        : {},
      layout: animationsSettings,
      vertices: component.vertex
        ? {
            [component.vertex]: { ...animationsSettings, onComplete: undefined }
          }
        : {}
    };
  }

  return {
    edges: component.edge
      ? {
          [component.edge]: {
            ...animationsSettings.component,
            onComplete: undefined
          }
        }
      : {},
    layout: animationsSettings.layout,
    vertices: component.vertex
      ? {
          [component.vertex]: {
            ...animationsSettings.component,
            onComplete: undefined
          }
        }
      : {}
  };
};

export const createAnimationsSettingsForBatchModification = (
  components: { edges?: Array<string>; vertices?: Array<string> },
  animationsSettings?: BatchModificationAnimationSettings
): GraphModificationAnimationsSettings => {
  if (!animationsSettings) {
    return {
      edges: {},
      vertices: {}
    };
  }

  if (isAnimationSettingsObject(animationsSettings)) {
    return {
      edges: Object.fromEntries(
        components.edges?.map(key => [
          key,
          { ...animationsSettings, onComplete: undefined }
        ]) ?? []
      ),
      layout: animationsSettings,
      vertices: Object.fromEntries(
        components.vertices?.map(key => [
          key,
          { ...animationsSettings, onComplete: undefined }
        ]) ?? []
      )
    };
  }

  if (
    isBatchModificationSettingsObjectWithEdgesAndVertices(animationsSettings)
  ) {
    return {
      edges: Object.fromEntries(
        components.edges?.map(key => [
          key,
          animationsSettings.vertices?.[key]
        ]) ?? []
      ),
      layout: animationsSettings.layout,
      vertices: Object.fromEntries(
        components.vertices?.map(key => [
          key,
          animationsSettings.edges?.[key]
        ]) ?? []
      )
    };
  }

  return {
    edges: Object.fromEntries(
      components.edges?.map(key => [
        key,
        {
          ...(animationsSettings as { components?: AnimationSettings })
            .components,
          onComplete: undefined
        }
      ]) ?? []
    ),
    layout: animationsSettings.layout,
    vertices: Object.fromEntries(
      components.vertices?.map(key => [
        key,
        {
          ...(animationsSettings as { components?: AnimationSettings })
            .components,
          onComplete: undefined
        }
      ]) ?? []
    )
  };
};

export const animateToValue = (
  fromValue: number,
  toValue: number,
  eps?: number,
  div = 1000
): number => {
  'worklet';
  const delta = toValue - fromValue;

  const minDelta = eps ?? 1;
  // Delta can be NaN when the difference between values is too small
  // (subtracting very close numbers can result in a number that is too small to be represented)
  if (isNaN(delta) || Math.abs(delta) < minDelta) {
    return toValue;
  }
  const factor = Math.max(0.1, Math.abs(delta) / div);
  return fromValue + delta * factor;
};

export const cancelVertexAnimations = <V>(
  vertexData: VertexComponentData<V>
) => {
  cancelAnimation(vertexData.points);
  cancelAnimation(vertexData.scale);
  cancelAnimation(vertexData.transformProgress);
};

export const cancelEdgeAnimations = <V>(edgeData: EdgeComponentData<V>) => {
  cancelAnimation(edgeData.animationProgress);
  cancelAnimation(edgeData.label.transform);
  cancelAnimation(edgeData.ordering);
  cancelAnimation(edgeData.points);
  cancelAnimation(edgeData.transformProgress);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cancelAnimations = (value: Record<string, any>) => {
  // Recursively cancel all animations of values nested in the object
  for (const key in value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const v = value[key];
    if (typeof v === 'object' && v !== null) {
      if (isSharedValue(v)) {
        cancelAnimation(v); // Cancel shared value animation
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        cancelAnimations(v); // Recursively cancel all animations of nested values
      }
    }
  }
};

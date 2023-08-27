/* eslint-disable import/no-unused-modules */
import {
  cancelAnimation,
  isSharedValue,
  runOnJS,
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

import { calcTranslationOnProgress } from './views';

const cancelComponentsAnimation = <V, E>(
  verticesData: Record<string, VertexComponentData<V>>,
  edgesData: Record<string, EdgeComponentData<E>>,
  layoutAnimationProgress: SharedValue<number>
): void => {
  'worklet';
  // Cancel layout animation
  cancelAnimation(layoutAnimationProgress);
  // Set current vertices positions as source and target positions
  for (const vertexData of Object.values(verticesData)) {
    const currentPosition = calcTranslationOnProgress(
      vertexData.transform.progress.value,
      vertexData.transform.points.value.source,
      vertexData.transform.points.value.target
    );
    vertexData.transform.points.value = {
      source: currentPosition,
      target: currentPosition
    };
  }
  // Set current edges positions as source and target positions
  for (const edgeData of Object.values(edgesData)) {
    const currentV1Position = calcTranslationOnProgress(
      edgeData.transform.progress.value,
      edgeData.transform.points.value.v1Source,
      edgeData.transform.points.value.v1Target
    );
    const currentV2Position = calcTranslationOnProgress(
      edgeData.transform.progress.value,
      edgeData.transform.points.value.v2Source,
      edgeData.transform.points.value.v2Target
    );
    edgeData.transform.points.value = {
      v1Source: currentV1Position,
      v1Target: currentV1Position,
      v2Source: currentV2Position,
      v2Target: currentV2Position
    };
  }
};

const updateComponentsTransformPoints = <V, E>(
  verticesData: Record<string, VertexComponentData<V>>,
  edgesData: Record<string, EdgeComponentData<E>>,
  verticesPositions: PlacedVerticesPositions
): void => {
  'worklet';
  // Set new target vertices positions
  for (const [key, vertexData] of Object.entries(verticesData)) {
    const targetPosition = verticesPositions[key];
    if (!targetPosition) {
      continue;
    }
    vertexData.transform.points.value = {
      source: vertexData.transform.points.value.source,
      target: targetPosition
    };
  }
  // Set new target edges positions
  for (const edgeData of Object.values(edgesData)) {
    const targetV1Position = verticesPositions[edgeData.v1Key];
    const targetV2Position = verticesPositions[edgeData.v2Key];
    if (!targetV1Position || !targetV2Position) {
      continue;
    }
    edgeData.transform.points.value = {
      v1Source: edgeData.transform.points.value.v1Source,
      v1Target: targetV1Position,
      v2Source: edgeData.transform.points.value.v2Source,
      v2Target: targetV2Position
    };
  }
};

const restartLayoutAnimation = (
  layoutAnimationProgress: SharedValue<number>,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  if (!layoutAnimationSettings) {
    layoutAnimationProgress.value = 1;
  } else {
    layoutAnimationProgress.value = 0;
    layoutAnimationProgress.value = withTiming(
      1,
      layoutAnimationSettings,
      finished => {
        if (finished && layoutAnimationSettings.onComplete) {
          runOnJS(layoutAnimationSettings.onComplete)();
        }
      }
    );
  }
};

export const updateComponentsTransform = <V, E>(
  verticesData: Record<string, VertexComponentData<V>>,
  edgesData: Record<string, EdgeComponentData<E>>,
  verticesPositions: PlacedVerticesPositions,
  layoutAnimationProgress: SharedValue<number>,
  layoutAnimationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  // Stop animation and set source and target vertices/edges positions to the current ones
  // (this is needed to prevent animation from jumping to the previous target position))
  cancelComponentsAnimation(verticesData, edgesData, layoutAnimationProgress);
  // Reset the animation progress
  layoutAnimationProgress.value = 0;
  // Set new target positions
  updateComponentsTransformPoints(verticesData, edgesData, verticesPositions);
  // Update the animation progress
  restartLayoutAnimation(layoutAnimationProgress, layoutAnimationSettings);
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
  cancelAnimation(vertexData.scale);
  cancelAnimation(vertexData.transform.points);
};

export const cancelEdgeAnimations = <V>(edgeData: EdgeComponentData<V>) => {
  cancelAnimation(edgeData.animationProgress);
  cancelAnimation(edgeData.label.transform);
  cancelAnimation(edgeData.ordering);
  cancelAnimation(edgeData.transform.points);
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

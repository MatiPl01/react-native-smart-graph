import {
  cancelAnimation,
  isSharedValue,
  runOnJS,
  withTiming
} from 'react-native-reanimated';

import { EdgeComponentData, VertexComponentData } from '@/types/data';
import { AnimatedVectorCoordinates, Vector } from '@/types/layout';
import {
  AllAnimationSettings,
  AnimationSettings,
  BatchModificationAnimationSettings,
  GraphModificationAnimationsSettings,
  SingleModificationAnimationSettings
} from '@/types/settings';

export const animateVerticesToFinalPositions = (
  animatedPositions: Record<string, AnimatedVectorCoordinates>,
  finalPositions: Record<string, Vector>,
  animationSettings: AllAnimationSettings | null
) => {
  'worklet';
  const finalPositionsEntries = Object.entries(finalPositions);

  for (let i = 0; i < finalPositionsEntries.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [key, finalPosition] = finalPositionsEntries[i]!;
    const animatedPosition = animatedPositions[key];
    if (!animatedPosition) continue;
    // If animationSettings is not null, animate to final position
    if (animationSettings) {
      const { duration, easing, onComplete } = animationSettings;
      animatedPosition.x.value = withTiming(finalPosition.x, {
        duration,
        easing
      });
      animatedPosition.y.value = withTiming(
        finalPosition.y,
        {
          duration,
          easing
        },
        // Call onComplete only once, when the last vertex animation is complete
        onComplete && i === finalPositionsEntries.length - 1
          ? (finished?: boolean) => {
              'worklet';
              runOnJS(onComplete)(finished);
            }
          : undefined
      );
    }
    // Otherwise, if animationSettings is null, just set final position
    else {
      animatedPosition.x.value = finalPosition.x;
      animatedPosition.y.value = finalPosition.y;
    }
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
  eps?: number
): number => {
  'worklet';
  const delta = toValue - fromValue;

  const minDelta = eps ?? 1;
  // Delta can be NaN when the difference between values is too small
  // (subtracting very close numbers can result in a number that is too small to be represented)
  if (isNaN(delta) || Math.abs(delta) < minDelta) {
    return toValue;
  }
  const factor = Math.max(0.1, Math.abs(delta) / 1000);
  return fromValue + delta * factor;
};

export const cancelVertexAnimations = <V>(
  vertexData: VertexComponentData<V>
) => {
  cancelAnimation(vertexData.scale);
  cancelAnimation(vertexData.currentRadius);
  cancelAnimation(vertexData.position.x);
  cancelAnimation(vertexData.position.y);
  cancelAnimation(vertexData.displayed);
};

export const cancelEdgeAnimations = <V>(edgeData: EdgeComponentData<V>) => {
  cancelAnimation(edgeData.animationProgress);
  cancelAnimation(edgeData.displayed);
  cancelAnimation(edgeData.edgesCount);
  cancelAnimation(edgeData.order);
  cancelAnimation(edgeData.labelHeight);
  cancelAnimation(edgeData.labelPosition.x);
  cancelAnimation(edgeData.labelPosition.y);
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

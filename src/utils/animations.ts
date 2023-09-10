/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  SingleModificationAnimationSettings
} from '@/types/settings';
import { Maybe } from '@/types/utils';

export const animateWithoutCallback = (
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

export const animateWithCallback = (
  value: SharedValue<number>,
  target: number,
  animationSettings?: Maybe<AllAnimationSettings>
): void => {
  'worklet';
  if (!animationSettings) {
    value.value = target;
    return;
  }
  const { duration, easing, onComplete } = animationSettings;
  value.value = withTiming(
    target,
    {
      duration,
      easing
    },
    finished => {
      if (onComplete) {
        runOnJS(onComplete)(finished);
      }
    }
  );
};

const ANIMATION_SETTINGS_KEYS = new Set(['duration', 'easing', 'onComplete']);

export const isAnimationSettingsObject = (
  obj: object
): obj is AnimationSettings =>
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
  config?: {
    div?: number;
    eps?: number;
    minFactor?: number;
  }
): number => {
  'worklet';
  const delta = toValue - fromValue;

  const minDelta = config?.eps ?? 1;
  // Delta can be NaN when the difference between values is too small
  // (subtracting very close numbers can result in a number that is too small to be represented)
  if (isNaN(delta) || Math.abs(delta) < minDelta) {
    return toValue;
  }
  const factor = Math.max(
    config?.minFactor ?? 0.1,
    Math.abs(delta) / (config?.div ?? 1000)
  );
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

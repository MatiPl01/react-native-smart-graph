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

const BATCH_MODIFICATION_WITH_EDGES_OR_VERTICES_SETTINGS_KEYS = new Set([
  'edges',
  'vertices',
  'layout'
]);

const isBatchModificationSettingsObjectWithEdgesOrVertices = (
  obj: object
): obj is {
  edges?:
    | Maybe<AnimationSettings>
    | Maybe<Record<string, Maybe<AnimationSettings>>>;
  layout?: Maybe<AnimationSettings>;
  vertices?:
    | Maybe<AnimationSettings>
    | Maybe<Record<string, Maybe<AnimationSettings>>>;
} =>
  Object.keys(obj).every(key =>
    BATCH_MODIFICATION_WITH_EDGES_OR_VERTICES_SETTINGS_KEYS.has(key)
  );

// In functions below onComplete callback is passed only to single animation
// to ensure that it will be called only once

export const createAnimationsSettingsForSingleModification = (
  component: { edge?: string; vertex?: string },
  animationsSettings?: SingleModificationAnimationSettings
): GraphModificationAnimationsSettings => {
  // Single value specified for all components
  if (animationsSettings === null) {
    // Disable animations
    return {
      edges: null,
      layout: null,
      vertices: null
    };
  }
  if (!animationsSettings) {
    // Use default animations
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

  // Separate values for animations (edge and layout or vertex and layout)
  return {
    edges: component.edge
      ? {
          [component.edge]: animationsSettings.component
        }
      : {},
    layout: animationsSettings.layout,
    vertices: component.vertex
      ? {
          [component.vertex]:
            // Remove onComplete callback if both edge and vertex are animated
            // (we want to call onComplete only once)
            component.edge && component.vertex
              ? animationsSettings.component && {
                  ...animationsSettings.component,
                  onComplete: undefined
                }
              : animationsSettings.component
        }
      : {}
  };
};

export const createAnimationsSettingsForBatchModification = (
  components: { edges?: Array<string>; vertices?: Array<string> },
  animationsSettings?: BatchModificationAnimationSettings
): GraphModificationAnimationsSettings => {
  // Single value specified for all components
  if (animationsSettings === null) {
    // Disable animations
    return {
      edges: null,
      layout: null,
      vertices: null
    };
  }
  if (!animationsSettings) {
    // Use default animations
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

  // Separate animation settings for specific components (or component groups)
  if (
    isBatchModificationSettingsObjectWithEdgesOrVertices(animationsSettings)
  ) {
    const edgesAnimationSettings = animationsSettings.edges;
    const verticesAnimationSettings = animationsSettings.vertices;

    return {
      edges:
        edgesAnimationSettings === undefined
          ? {}
          : edgesAnimationSettings &&
            Object.fromEntries(
              components.edges?.map((key, index) => [
                key,
                isAnimationSettingsObject(edgesAnimationSettings)
                  ? index === 0
                    ? edgesAnimationSettings
                    : // Ensure that onComplete callback is called only once
                      { ...edgesAnimationSettings, onComplete: undefined }
                  : edgesAnimationSettings[key]
              ]) ?? []
            ),
      layout: animationsSettings.layout,
      vertices:
        verticesAnimationSettings === undefined
          ? {}
          : verticesAnimationSettings &&
            Object.fromEntries(
              components.vertices?.map((key, index) => [
                key,
                isAnimationSettingsObject(verticesAnimationSettings)
                  ? index === 0
                    ? verticesAnimationSettings
                    : // Ensure that onComplete callback is called only once
                      { ...verticesAnimationSettings, onComplete: undefined }
                  : verticesAnimationSettings[key]
              ]) ?? []
            )
    };
  }

  // Separate animation settings for layout and all components
  return {
    edges: Object.fromEntries(
      components.edges?.map((key, index) => [
        key,
        animationsSettings.components && index === 0
          ? animationsSettings.components
          : // Ensure that onComplete callback is called only once
            { ...animationsSettings.components, onComplete: undefined }
      ]) ?? []
    ),
    layout: animationsSettings.layout,
    vertices: Object.fromEntries(
      components.vertices?.map((key, index) => [
        key,
        animationsSettings.components &&
        index === 0 &&
        (!components.edges || !components.edges.length)
          ? animationsSettings.components
          : // Ensure that onComplete callback is called only once
            { ...animationsSettings.components, onComplete: undefined }
      ]) ?? []
    )
  };
};

export const animateToValue = (
  fromValue: number,
  toValue: number,
  config?: {
    eps?: number;
    rate?: number; // This defines the rate of smoothing
  }
): number => {
  'worklet';
  const delta = toValue - fromValue;
  const minDelta = config?.eps ?? 0.01; // It can never be exactly zero, but we can get pretty close

  if (isNaN(delta) || Math.abs(delta) < minDelta) {
    return toValue;
  }

  const rate = config?.rate ?? 0.1; // Default rate is 0.1 if not provided
  const newValue = fromValue + rate * delta;

  return newValue;
};

export const cancelVertexAnimations = <V>(
  vertexData: VertexComponentData<V>
) => {
  cancelAnimation(vertexData.animationProgress);
  cancelAnimation(vertexData.focusProgress);
  cancelAnimation(vertexData.label.transform);
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

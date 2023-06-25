import { Vector } from '@shopify/react-native-skia';
import { runOnJS, SharedValue, withTiming } from 'react-native-reanimated';

import {
  EdgeComponentRenderData,
  VertexComponentRenderData
} from '@/types/components';
import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  AnimationSettings,
  AnimationsSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings/animations';

export const animateVerticesToFinalPositions = (
  animatedPositions: Record<string, AnimatedVectorCoordinates>,
  finalPositions: Record<string, Vector>,
  { duration, easing, onComplete }: AnimationSettings
) => {
  'worklet';
  const finalPositionsEntries = Object.entries(finalPositions);

  finalPositionsEntries.forEach(([key, finalPosition], idx) => {
    const animatedPosition = animatedPositions[key];
    if (animatedPosition) {
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
        onComplete && idx === finalPositionsEntries.length - 1
          ? () => {
              'worklet';
              runOnJS(onComplete)();
            }
          : undefined
      );
    }
  });
};

const updateComponentsFocusProgress = <
  D extends { focusProgress: SharedValue<number> }
>(
  focusedKeysSet: Set<string> | null,
  renderedComponentsData: Record<string, D>,
  animationSettings?: AnimationSettings
) => {
  'worklet';
  const { onComplete, ...timingConfig } = animationSettings ?? {};

  // Disable focus for all components
  if (!focusedKeysSet) {
    Object.values(renderedComponentsData).forEach(({ focusProgress }) => {
      focusProgress.value = withTiming(0, timingConfig, onComplete);
    });
  } else {
    Object.entries(renderedComponentsData).forEach(
      ([key, { focusProgress }]) => {
        if (focusedKeysSet?.has(key)) {
          focusProgress.value = withTiming(1, timingConfig, onComplete);
        } else {
          focusProgress.value = withTiming(-1, timingConfig, onComplete);
        }
      }
    );
  }
};

export const updateComponentsFocusFocus = (
  focusedComponents: {
    edges?: string[];
    vertices?: string[];
  } | null,
  renderedVerticesData: Record<string, VertexComponentRenderData>,
  renderedEdgesData: Record<string, EdgeComponentRenderData>,
  animationSettings?: AnimationSettings
) => {
  'worklet';

  // Turn on focus if there are focused components
  if (focusedComponents) {
    const focusedVerticesSet = new Set(focusedComponents.vertices ?? []);
    const focusedEdgesSet = new Set(focusedComponents.edges ?? []);
    // Update vertices focusProgress
    updateComponentsFocusProgress(
      focusedVerticesSet,
      renderedVerticesData,
      animationSettings
    );
    // Update edges focusProgress
    updateComponentsFocusProgress(
      focusedEdgesSet,
      renderedEdgesData,
      animationSettings
    );
  }
  // Otherwise, turn off focus for all components
  else {
    // Update vertices focusProgress
    updateComponentsFocusProgress(
      null,
      renderedVerticesData,
      animationSettings
    );
    // Update edges focusProgress
    updateComponentsFocusProgress(null, renderedEdgesData, animationSettings);
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
): AnimationsSettings => {
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
  components: { edges?: string[]; vertices?: string[] },
  animationsSettings?: BatchModificationAnimationSettings
): AnimationsSettings => {
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

import { Vector } from '@shopify/react-native-skia';
import { runOnJS, withTiming } from 'react-native-reanimated';

import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  AnimationSettings,
  AnimationsSettings,
  BatchModificationAnimationSettings,
  SingleModificationAnimationSettings
} from '@/types/settings/animations';

export function animateVerticesToFinalPositions(
  animatedPositions: Record<string, AnimatedVectorCoordinates>,
  finalPositions: Record<string, Vector>,
  { duration, easing, onComplete }: AnimationSettings
) {
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
          ? finished => {
              'worklet';
              if (!finished) return;
              runOnJS(onComplete)();
            }
          : undefined
      );
    }
  });
}

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
  vertices: Record<string, AnimationSettings>;
  layout: AnimationSettings;
} =>
  Object.keys(obj).every(key =>
    BATCH_MODIFICATION_WITH_EDGES_AND_VERTICES_SETTINGS_KEYS.has(key)
  );

// In functions below onComplete callback is passed only to single animation
// to ensure that it will be called only once

export const createAnimationsSettingsForSingleModification = (
  component: { vertex?: string; edge?: string },
  animationsSettings?: SingleModificationAnimationSettings
): AnimationsSettings => {
  if (!animationsSettings) {
    return {
      vertices: {},
      edges: {}
    };
  }

  if (isAnimationSettingsObject(animationsSettings)) {
    return {
      layout: { ...animationsSettings, onComplete: undefined },
      vertices: component.vertex
        ? {
            [component.vertex]: animationsSettings
          }
        : {},
      edges: component.edge
        ? { [component.edge]: { ...animationsSettings, onComplete: undefined } }
        : {}
    };
  }

  return {
    layout: { ...animationsSettings.layout, onComplete: undefined },
    vertices: component.vertex
      ? {
          [component.vertex]: animationsSettings.component
        }
      : {},
    edges: component.edge
      ? {
          [component.edge]: {
            ...animationsSettings.component,
            onComplete: undefined
          }
        }
      : {}
  };
};

export const createAnimationsSettingsForBatchModification = (
  components: { vertices?: string[]; edges?: string[] },
  animationsSettings?: BatchModificationAnimationSettings
): AnimationsSettings => {
  if (!animationsSettings) {
    return {
      vertices: {},
      edges: {}
    };
  }

  if (isAnimationSettingsObject(animationsSettings)) {
    return {
      layout: { ...animationsSettings, onComplete: undefined },
      vertices: Object.fromEntries(
        components.vertices?.map((key, idx) => [
          key,
          idx === components.vertices.length - 1
            ? animationsSettings
            : { ...animationsSettings, onComplete: undefined }
        ]) || []
      ),
      edges: Object.fromEntries(
        components.edges?.map(key => [
          key,
          { ...animationsSettings, onComplete: undefined }
        ]) || []
      )
    };
  }

  if (
    isBatchModificationSettingsObjectWithEdgesAndVertices(animationsSettings)
  ) {
    return {
      layout: animationsSettings.layout, // TODO
      vertices: Object.fromEntries(
        components.vertices?.map(key => [
          key,
          animationsSettings.edges?.[key]
        ]) || []
      ),
      edges: Object.fromEntries(
        components.edges?.map(key => [
          key,
          animationsSettings.vertices?.[key]
        ]) || []
      )
    };
  }

  return {
    layout: animationsSettings.layout,
    vertices: Object.fromEntries(
      components.vertices?.map(key => [
        key,
        {
          ...(animationsSettings as { components?: AnimationSettings })
            .components,
          onComplete: undefined
        }
      ]) || []
    ),
    edges: Object.fromEntries(
      components.edges?.map(key => [
        key,
        {
          ...(animationsSettings as { components?: AnimationSettings })
            .components,
          onComplete: undefined
        }
      ]) || []
    )
  };
};

import { PropsWithChildren, useMemo } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import {
  FocusContextType,
  GesturesContextType,
  TransformContextType
} from '@/providers/canvas';
import { withGraphData } from '@/providers/graph/data';
import { VertexComponentRenderData } from '@/types/components';
import { GraphFocusSettings } from '@/types/settings';

import { useVertexFocusContext } from './VertexFocusProvider';

type MultiStepFocusProviderProps = PropsWithChildren<{
  focusContext: FocusContextType;
  gesturesContext: GesturesContextType;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphFocusSettings;
  transformContext: TransformContextType;
}>;

function MultiStepFocusProvider({
  children,
  focusContext,
  gesturesContext,
  renderedVerticesData,
  settings,
  transformContext
}: MultiStepFocusProviderProps) {
  // CONTEXT VALUES
  // Vertex focus context values
  const { isVertexFocused } = useVertexFocusContext();

  // MULTI STEP FOCUS DATA
  const orderedFocusPoints = useMemo(
    () =>
      Object.entries(settings.points)
        .map(([key, value]) => ({ startsAt: +key, value }))
        .sort(({ startsAt: a }, { startsAt: b }) => a - b),
    [settings.points]
  );

  // OTHER VALUES
  const isEnabled = useDerivedValue(
    // Enable the multi step focus when the vertex is not focused
    // and no gesture is being performed
    () => !isVertexFocused.value && !gesturesContext.isGestureActive.value
  );
  // Index of the current focus step
  const currentStep = useSharedValue<number>(0);
  // Target focus point coordinates
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);

  // Update the focus step when the array of focus points changes
  // or the new progress property is set
  // (set the step index only if the multi step focus is enabled)
  // useAnimatedReaction(
  //   () => isEnabled.value,
  //   enabled => {
  //     if (!enabled) {
  //       currentStep.value = -1;
  //       return;
  //     }
  //     // Set the current step index
  //     const step = binarySearchLE(
  //       orderedFocusPoints,
  //       settings.progress.value,
  //       point => point.startsAt
  //     );
  //     if (step === -1) {
  //       currentStep.value = -1;
  //       return;
  //     }
  //     // Start (or restart) the focus animation by calling the startFocus
  //     // method from the focus context
  //     if (currentStep.value === -1) {
  //       focusContext.startFocus(
  //         {
  //           gesturesDisabled: !!settings.gesturesDisabled,
  //           key: orderedFocusPoints[currentStep.value]?.value.key ?? ''
  //         },
  //         // This indicates that the progress value won't be updated
  //         // automatically by the focus context (it will be updated in
  //         // this provider)
  //         null
  //       );
  //     }
  //     currentStep.value = step;
  //   },
  //   [orderedFocusPoints, settings.progress, settings.gesturesDisabled]
  // );

  // useAnimatedReaction(
  //   () => ({
  //     progress: settings.progress.value,
  //     step: currentStep.value
  //   }),
  //   ({ progress, step }) => {
  //     if (step === -1) return;

  //     // Update the current step
  //     let currentPoint = orderedFocusPoints[step];
  //     let previousPoint = orderedFocusPoints[step - 1];
  //     if (!currentPoint) return;
  //     if (progress >= currentPoint.startsAt) {
  //       currentStep.value = step + 1;
  //     } else if (previousPoint && progress < previousPoint.startsAt) {
  //       currentStep.value = step - 1;
  //     }

  //     // if (step === null) return;
  //     // let currentPoint = orderedFocusPoints[step];
  //     // if (!currentPoint) return;
  //     // if (progress >= currentPoint.startsAt) {
  //     //   currentStep.value = step + 1;
  //     // } else if (progress < currentPoint.startsAt) {
  //     //   currentStep.value = step - 1;
  //     // }
  //     // currentPoint = orderedFocusPoints[currentStep.value];
  //     // if (!currentPoint) return;
  //     // const previousPoint = orderedFocusPoints[currentStep.value - 1];
  //     // const stepProgress =
  //     //   (currentPoint.startsAt - progress) /
  //     //   (currentPoint.startsAt - (previousPoint?.startsAt ?? 0));
  //     // if (!previousPoint) {
  //     //   focusContext.focusTransitionProgress.value = stepProgress;
  //     // }
  //   },
  //   [renderedVerticesData]
  // );

  // useAnimatedReaction(
  //   () => focusContext.focusTransitionProgress.value,
  //   p => {
  //     console.log(p);
  //   }
  // );

  // // Update the focus step when the multi step focus is enabled
  // // and the progress value is modified
  // useAnimatedReaction(
  //   () => ({
  //     enabled: isEnabled.value,
  //     progress: settings.progress.value
  //   }),
  //   ({ enabled, progress: totalProgress }) => {
  //     if (!enabled) return;
  //     // const {
  //     //   after,
  //     //   before,
  //     //   progress: stepProgress
  //     // } = calcMultiStepFocusPoint(totalProgress, orderedFocusPoints);

  //     console.log(before, after, stepProgress);
  //   }
  // );

  // const focusData = useMemo<FocusData>(
  //   () => ({
  //     gesturesDisabled: !!settings.gesturesDisabled,
  //     key: calcMultiStepFocusPoint(settings.progress.value, orderedFocusPoints)
  //       .after
  //   }),
  //   [settings.gesturesDisabled, settings.progress, orderedFocusPoints]
  // );
  // const previousKey = useSharedValue<null | string>(null);

  // useAnimatedReaction(
  //   () => ({
  //     disabled: isVertexFocused.value,
  //     focusedKey: focusContext.focus.key.value,
  //     progress: settings.progress.value
  //   }),
  //   ({ disabled, focusedKey, progress }) => {
  //     if (disabled) return;
  //     if (focusedKey === null) {
  //       // TODO - fix gestures (should have higher priority than focus)
  //       focusContext.startFocus(focusData, DEFAULT_FOCUS_ANIMATION_SETTINGS); // TODO - maybe add a custom animation settings prop?
  //     }
  //     const { key, progress: pointProgress } = calcMultiStepFocusPoint(
  //       progress,
  //       orderedFocusPoints
  //     );

  //     focusContext.focus.key.value = key;
  //     // focusContext.focus.x.value = vertexData.x - dx / vertexData.scale;
  //     // focusContext.focus.y.value = vertexData.y - dy / vertexData.scale;
  //     // focusContext.focus.scale.value = vertexData.scale;
  //   },
  //   [settings.progress, renderedVerticesData]
  // );

  return <>{children}</>;
}

export default withGraphData(
  MultiStepFocusProvider,
  ({ renderedVerticesData }) => ({ renderedVerticesData })
);

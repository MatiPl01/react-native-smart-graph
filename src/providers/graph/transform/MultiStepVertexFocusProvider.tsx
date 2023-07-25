import { PropsWithChildren, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { FocusContextType } from '@/providers/canvas';
import { withGraphData } from '@/providers/graph/data';
import { VertexComponentRenderData } from '@/types/components';
import { GraphFocusSettings } from '@/types/settings';

import { useVertexFocusContext } from './VertexFocusProvider';

type MultiStepFocusProviderProps = PropsWithChildren<{
  focusContext: FocusContextType;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphFocusSettings;
}>;

// TODO - add focus points validation (startAt should be between 0 and 1)
function MultiStepFocusProvider({
  children,
  focusContext,
  renderedVerticesData,
  settings
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
  // const focusData = useMemo<FocusData>(
  //   () => ({
  //     gesturesDisabled: !!settings.gesturesDisabled,
  //     key: calcMultiStepFocusPoint(settings.progress.value, orderedFocusPoints)
  //       .after.key
  //   }),
  //   [settings.gesturesDisabled, settings.progress, orderedFocusPoints]
  // );
  const previousKey = useSharedValue<null | string>(null);

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

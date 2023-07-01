import { memo, useEffect } from 'react';
import {
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { useComponentFocus } from '@/hooks/focus';
import { VertexFocusContextType } from '@/providers/graph';
import {
  DirectedCurvedEdgeComponentProps,
  DirectedStraightEdgeComponentProps,
  EdgeComponentProps,
  UndirectedCurvedEdgeComponentProps,
  UndirectedStraightEdgeComponentProps
} from '@/types/components';
import { updateComponentAnimationState } from '@/utils/components';

import DirectedCurvedEdgeComponent from './curved/DirectedCurvedEdgeComponent';
import UndirectedCurvedEdgeComponent from './curved/UndirectedCurvedEdgeComponent';
import DirectedStraightEdgeComponent from './straight/DirectedStraightEdgeComponent';
import UndirectedStraightEdgeComponent from './straight/UndirectedStraightEdgeComponent';

function EdgeComponent<E, V>({
  animationSettings,
  arrowRenderer,
  edge,
  edgeRenderer,
  edgesCount,
  focusKey,
  focusTransitionProgress,
  labelRenderer,
  onRemove,
  order,
  removed,
  ...restProps
}: EdgeComponentProps<E, V> & VertexFocusContextType) {
  // ANIMATION
  // Use a helper value to ensure that the animation progress is never negative
  const animationProgressHelper = useSharedValue(0);
  const animationProgress = useDerivedValue(() =>
    Math.max(0, animationProgressHelper.value)
  );

  // EDGE ORDERING
  // Target edge order
  const animatedOrder = useSharedValue(order);
  const animatedEdgesCount = useSharedValue(edgesCount);

  // EDGE FOCUS
  // Edge focus progress
  const focusProgress = useSharedValue(0);

  // Update current vertex focus progress based on the global
  // focus transition progress and the focused vertex key
  useComponentFocus(focusProgress, focusTransitionProgress, focusKey);

  // Edge mount/unmount animation
  useEffect(() => {
    updateComponentAnimationState(
      edge.key,
      animationProgressHelper,
      animationSettings,
      removed,
      onRemove
    );
  }, [removed, animationSettings]);

  // Edge ordering animation
  useEffect(() => {
    const { onComplete: _, ...settingsWithoutCallback } = animationSettings;
    animatedOrder.value = withTiming(order, settingsWithoutCallback);
    animatedEdgesCount.value = withTiming(edgesCount, settingsWithoutCallback);
  }, [order, edgesCount]);

  const sharedProps = {
    ...restProps,
    animatedEdgesCount,
    animatedOrder,
    animationProgress,
    edge,
    focusKey,
    focusTransitionProgress: focusProgress,
    renderers: arrowRenderer
      ? {
          arrow: arrowRenderer,
          edge: edgeRenderer,
          label: labelRenderer
        }
      : {
          edge: edgeRenderer,
          label: labelRenderer
        }
  };

  switch (sharedProps.componentSettings.type) {
    case 'straight':
      return edge.isDirected() ? (
        <DirectedStraightEdgeComponent
          {...(sharedProps as DirectedStraightEdgeComponentProps<E, V>)}
        />
      ) : (
        <UndirectedStraightEdgeComponent
          {...(sharedProps as UndirectedStraightEdgeComponentProps<E, V>)}
        />
      );
    case 'curved':
      return edge.isDirected() ? (
        <DirectedCurvedEdgeComponent
          {...(sharedProps as DirectedCurvedEdgeComponentProps<E, V>)}
        />
      ) : (
        <UndirectedCurvedEdgeComponent
          {...(sharedProps as UndirectedCurvedEdgeComponentProps<E, V>)}
        />
      );
  }
}

export default memo(EdgeComponent) as <E, V>(
  props: EdgeComponentProps<E, V> & VertexFocusContextType
) => JSX.Element;

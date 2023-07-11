import { memo, useEffect } from 'react';
import {
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

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
  onRemove,
  order,
  removed,
  ...restProps
}: EdgeComponentProps<E, V>) {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    renderers: arrowRenderer
      ? {
          arrow: arrowRenderer,
          edge: edgeRenderer
        }
      : {
          edge: edgeRenderer
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
  props: EdgeComponentProps<E, V>
) => JSX.Element;

import { memo, useEffect } from 'react';
import {
  useAnimatedReaction,
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
  animationProgress,
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

  // EDGE ORDERING
  // Target edge order
  const animatedOrder = useSharedValue(order.value);
  const animatedEdgesCount = useSharedValue(edgesCount.value);

  // Edge mount/unmount animation
  useEffect(() => {
    updateComponentAnimationState(
      edge.key,
      animationProgress,
      animationSettings,
      removed,
      onRemove
    );
  }, [removed, animationSettings]);

  // Use separate order and count values to make their changes animated
  useAnimatedReaction(
    () => ({
      count: edgesCount.value,
      ord: order.value
    }),
    ({ count, ord }) => {
      const { onComplete: _, ...settingsWithoutCallback } = animationSettings;
      animatedOrder.value = withTiming(ord, settingsWithoutCallback);
      animatedEdgesCount.value = withTiming(count, settingsWithoutCallback);
    }
  );

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

  switch (sharedProps.componentSettings.edge.type) {
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

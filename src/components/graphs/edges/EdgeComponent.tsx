import { memo, useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

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
  labelRenderer,
  onRemove,
  order,
  removed,
  ...restProps
}: EdgeComponentProps<E, V>) {
  // ANIMATION
  // Edge render animation progress
  const animationProgress = useSharedValue(0);

  // EDGE ORDERING
  // Target edge order
  const animatedOrder = useSharedValue(order);
  const animatedEdgesCount = useSharedValue(edgesCount);

  // EDGE FOCUS
  // Edge focus progress
  const focusProgress = useSharedValue(0);

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

  // Edge ordering animation
  useEffect(() => {
    const settingsWithoutCallback = {
      ...animationSettings,
      onComplete: () => undefined
    };
    animatedOrder.value = withTiming(order, settingsWithoutCallback);
    animatedEdgesCount.value = withTiming(edgesCount, settingsWithoutCallback);
  }, [order, edgesCount]);

  const sharedProps = {
    ...restProps,
    animatedEdgesCount,
    animatedOrder,
    animationProgress,
    edge,
    focusProgress,
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
  props: EdgeComponentProps<E, V>
) => JSX.Element;

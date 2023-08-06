import { memo, useEffect } from 'react';
import {
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import {
  DirectedStraightEdgeComponentProps,
  EdgeComponentProps,
  InnerEdgeComponentProps
} from '@/types/components';
import { updateComponentAnimationState } from '@/utils/components';

import DirectedCurvedEdgeComponent from './curved/DirectedCurvedEdgeComponent';
import UndirectedCurvedEdgeComponent from './curved/UndirectedCurvedEdgeComponent';
import DirectedStraightEdgeComponent from './straight/DirectedStraightEdgeComponent';
import UndirectedStraightEdgeComponent from './straight/UndirectedStraightEdgeComponent';

const areDirectedStraightEdgeComponentProps = <V, E>(
  props: InnerEdgeComponentProps<V, E>
): props is DirectedStraightEdgeComponentProps<V, E> => {
  return true;
};

function EdgeComponent<V, E, P extends InnerEdgeComponentProps<V, E>>(
  props: EdgeComponentProps<V, E, P>
) {
  const {
    animationProgress,
    animationSettings,
    edge,
    edgesCount,
    onRemove,
    order,
    removed,
    ...restProps
  } = props;

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onComplete: _, ...settingsWithoutCallback } = animationSettings;
      animatedOrder.value = withTiming(ord, settingsWithoutCallback);
      animatedEdgesCount.value = withTiming(count, settingsWithoutCallback);
    }
  );

  const innerProps = {
    ...restProps,
    animatedEdgesCount,
    animatedOrder,
    animationProgress,
    animationSettings,
    edge
  };

  switch (innerProps.settings.edge.type) {
    case 'straight':
      return areDirectedStraightEdgeComponentProps(innerProps) ? (
        <DirectedStraightEdgeComponent {...innerProps} />
      ) : (
        <UndirectedStraightEdgeComponent {...innerProps} />
      );
    case 'curved':
      return areDirectedGraphRenderers(renderers) ? (
        <DirectedCurvedEdgeComponent {...innerProps} />
      ) : (
        <UndirectedCurvedEdgeComponent {...innerProps} />
      );
  }
}

export default memo(EdgeComponent) as <
  V,
  E,
  P extends InnerEdgeComponentProps<V, E>
>(
  props: EdgeComponentProps<V, E, P>
) => JSX.Element;

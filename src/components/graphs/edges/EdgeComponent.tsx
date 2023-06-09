import { memo, useEffect, useMemo } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import {
  DirectedCurvedEdgeComponentProps,
  DirectedStraightEdgeComponentProps,
  EdgeComponentProps,
  UndirectedCurvedEdgeComponentProps,
  UndirectedStraightEdgeComponentProps
} from '@/types/components/edges';
import { updateComponentAnimationState } from '@/utils/components';

import DirectedCurvedEdgeComponent from './curved/DirectedCurvedEdgeComponent';
import UndirectedCurvedEdgeComponent from './curved/UndirectedCurvedEdgeComponent';
import DirectedStraightEdgeComponent from './straight/DirectedStraightEdgeComponent';
import UndirectedStraightEdgeComponent from './straight/UndirectedStraightEdgeComponent';

function EdgeComponent<E, V>({
  edge,
  order,
  edgesCount,
  removed,
  onRemove,
  animationSettings,
  edgeRenderer,
  arrowRenderer,
  labelRenderer,
  ...restProps
}: EdgeComponentProps<E, V>) {
  // RENDERERS
  const edgeRenderers = useMemo(
    () =>
      arrowRenderer
        ? {
            edge: edgeRenderer,
            arrow: arrowRenderer,
            label: labelRenderer
          }
        : {
            edge: edgeRenderer,
            label: labelRenderer
          },
    [edgeRenderer, arrowRenderer, labelRenderer]
  );

  // ANIMATION
  // Edge render animation progress
  const animationProgress = useSharedValue(0);

  // EDGE ORDERING
  // Target edge order
  const animatedOrder = useSharedValue(order);
  const animatedEdgesCount = useSharedValue(edgesCount);

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
    edge,
    animationProgress,
    animatedOrder,
    animatedEdgesCount,
    renderers: edgeRenderers
  };

  switch (sharedProps.settings.type) {
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

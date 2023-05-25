import { memo, useEffect } from 'react';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

import EASING from '@/constants/easings';
import {
  DirectedCurvedEdgeComponentProps,
  DirectedStraightEdgeComponentProps,
  EdgeComponentProps,
  UndirectedCurvedEdgeComponentProps,
  UndirectedStraightEdgeComponentProps
} from '@/types/components/edges';

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
  ...restProps
}: EdgeComponentProps<E, V>) {
  const key = edge.key;
  // ANIMATION
  // Edge render animation progress
  const animationProgress = useSharedValue(0);
  // EDGE ORDERING
  // Target edge order
  const animatedOrder = useSharedValue(order);
  const animatedEdgesCount = useSharedValue(edgesCount);

  // Edge mount/unmount animation
  useEffect(() => {
    // ANimate vertex on mount
    if (!removed) {
      // Animate vertex on mount
      animationProgress.value = withTiming(1, {
        // TODO - make this a setting
        duration: 500,
        easing: EASING.bounce
      });
    }
    // Animate vertex removal
    else {
      animationProgress.value = withTiming(
        0,
        {
          duration: 250
        },
        finished => {
          if (finished) {
            runOnJS(onRemove)(key);
          }
        }
      );
    }
  }, [removed]);

  // Edge ordering animation
  useEffect(() => {
    animatedOrder.value = withTiming(order, {
      duration: 500 // TODO - make this a setting
    });
    animatedEdgesCount.value = withTiming(edgesCount, {
      duration: 500 // TODO - make this a setting
    });
  }, [order, edgesCount]);

  const sharedProps = {
    ...restProps,
    edge,
    animationProgress,
    animatedOrder,
    animatedEdgesCount
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

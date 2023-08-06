/* eslint-disable no-redeclare */
import { memo, useEffect } from 'react';
import {
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import {
  DirectedCurvedEdgeComponentProps,
  DirectedEdgeComponentProps,
  EdgeComponentProps,
  InnerEdgeComponentProps,
  UndirectedCurvedEdgeComponentProps,
  UndirectedEdgeComponentProps
} from '@/types/components';
import { EdgeComponentData } from '@/types/data';
import { DirectedEdge, UndirectedEdge } from '@/types/models';
import { updateComponentAnimationState } from '@/utils/components';

import DirectedCurvedEdgeComponent from './curved/DirectedCurvedEdgeComponent';
import UndirectedCurvedEdgeComponent from './curved/UndirectedCurvedEdgeComponent';
import DirectedStraightEdgeComponent from './straight/DirectedStraightEdgeComponent';
import UndirectedStraightEdgeComponent from './straight/UndirectedStraightEdgeComponent';

type InnerEdgeProps<V, E> = Omit<InnerEdgeComponentProps<V, E>, 'data'> & {
  data:
    | EdgeComponentData<DirectedEdge<V, E>>
    | EdgeComponentData<UndirectedEdge<V, E>>;
};

const areDirectedEdgeProps = <V, E>(
  props: InnerEdgeProps<V, E>
): props is DirectedEdgeComponentProps<V, E> => {
  return props.data.edge.isDirected();
};

const areUndirectedEdgeProps = <V, E>(
  props: InnerEdgeProps<V, E>
): props is UndirectedEdgeComponentProps<V, E> => {
  return !props.data.edge.isDirected();
};

function areCurvedEdgeProps<V, E>(
  props: UndirectedEdgeComponentProps<V, E>
): props is UndirectedCurvedEdgeComponentProps<V, E>;

function areCurvedEdgeProps<V, E>(
  props: DirectedEdgeComponentProps<V, E>
): props is DirectedCurvedEdgeComponentProps<V, E>;

function areCurvedEdgeProps<V, E>(
  props: InnerEdgeProps<V, E>
): props is
  | DirectedCurvedEdgeComponentProps<V, E>
  | UndirectedCurvedEdgeComponentProps<V, E> {
  return props.settings.edge.type === 'curved';
}

function EdgeComponent<V, E>({
  data,
  edgesCount,
  onRemove,
  order,
  removed,
  renderers,
  settings
}: EdgeComponentProps<V, E>) {
  const { animationProgress, animationSettings, edge } = data;

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

  const innerProps: InnerEdgeProps<V, E> = {
    animatedEdgesCount,
    animatedOrder,
    data,
    renderers,
    settings
  };

  if (areDirectedEdgeProps(innerProps)) {
    return areCurvedEdgeProps(innerProps) ? (
      <DirectedCurvedEdgeComponent {...innerProps} />
    ) : (
      <DirectedStraightEdgeComponent {...innerProps} />
    );
  }
  if (areUndirectedEdgeProps(innerProps)) {
    return areCurvedEdgeProps(innerProps) ? (
      <UndirectedCurvedEdgeComponent {...innerProps} />
    ) : (
      <UndirectedStraightEdgeComponent {...innerProps} />
    );
  }

  return null; // Should never happen
}

export default memo(EdgeComponent) as <V, E>(
  props: EdgeComponentProps<V, E>
) => JSX.Element;

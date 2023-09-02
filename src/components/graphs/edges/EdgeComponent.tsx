/* eslint-disable no-redeclare */
import { memo, useEffect } from 'react';

import {
  DirectedCurvedEdgeComponentProps,
  DirectedEdgeComponentProps,
  EdgeComponentProps,
  InnerEdgeComponentProps,
  UndirectedCurvedEdgeComponentProps,
  UndirectedEdgeComponentProps
} from '@/types/components';
import { updateComponentAnimationState } from '@/utils/components';

import DirectedCurvedEdgeComponent from './curved/DirectedCurvedEdgeComponent';
import UndirectedCurvedEdgeComponent from './curved/UndirectedCurvedEdgeComponent';
import DirectedStraightEdgeComponent from './straight/DirectedStraightEdgeComponent';
import UndirectedStraightEdgeComponent from './straight/UndirectedStraightEdgeComponent';

type InnerEdgeProps<V, E> = Omit<
  InnerEdgeComponentProps<V, E>,
  'renderers' | 'settings'
> &
  Pick<EdgeComponentProps<V, E>, 'renderers' | 'settings'>;

const areDirectedEdgeProps = <V, E>(
  props: InnerEdgeProps<V, E>
): props is DirectedEdgeComponentProps<V, E> => {
  return props.data.isDirected;
};

const areUndirectedEdgeProps = <V, E>(
  props: InnerEdgeProps<V, E>
): props is UndirectedEdgeComponentProps<V, E> => {
  return !props.data.isDirected;
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
  onRemove,
  renderers,
  settings
}: EdgeComponentProps<V, E>) {
  // Edge mount/unmount animation
  useEffect(() => {
    updateComponentAnimationState(
      data.key,
      data.animationProgress,
      data.animationSettings,
      data.removed,
      () => onRemove(data.key)
    );
  }, [data.removed, data.animationSettings]);

  const innerProps = {
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

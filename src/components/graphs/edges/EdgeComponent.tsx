import { memo, useEffect } from 'react';
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import EASING from '@/constants/easings';
import { DirectedEdge, UndirectedEdge } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import {
  DirectedEdgeRenderers,
  UndirectedEdgeRenderers
} from '@/types/renderer';
import {
  DirectedGraphComponentsSettings,
  UndirectedGraphComponentsSettings
} from '@/types/settings';

import EdgeLabelComponent from '../labels/EdgeLabelComponent';
import DirectedEdgeComponent from './DirectedEdgeComponent';
import UndirectedEdgeComponent from './UndirectedEdgeComponent';

const areDirectedEdgeComponentProps = <E, V>(
  props: EdgeComponentProps<E, V>
): props is DirectedEdgeComponentProps<E, V> => {
  return (props.renderers as DirectedEdgeRenderers<E>).arrow !== undefined;
};

type SharedEdgeComponentProps = {
  v1Position: AnimatedVectorCoordinates;
  v2Position: AnimatedVectorCoordinates;
  vertexRadius: number;
  removed: boolean;
  onRemove: (key: string) => void;
};

type UndirectedEdgeComponentProps<E, V> = SharedEdgeComponentProps & {
  edge: UndirectedEdge<E, V>;
  renderers: UndirectedEdgeRenderers<E>;
  settings: UndirectedGraphComponentsSettings['edge'];
};

type DirectedEdgeComponentProps<E, V> = SharedEdgeComponentProps & {
  edge: DirectedEdge<E, V>;
  renderers: DirectedEdgeRenderers<E>;
  settings: DirectedGraphComponentsSettings['edge'];
};

export type EdgeComponentProps<E, V> =
  | UndirectedEdgeComponentProps<E, V>
  | DirectedEdgeComponentProps<E, V>;

function EdgeComponent<E, V>(props: EdgeComponentProps<E, V>) {
  const { edge, v1Position, v2Position, vertexRadius, removed, onRemove } =
    props;
  const key = edge.key;

  // POSITION
  // First vertex position
  const p1 = useDerivedValue(() => ({
    x: v1Position.x.value,
    y: v1Position.y.value
  }));
  // Second vertex position
  const p2 = useDerivedValue(() => ({
    x: v2Position.x.value,
    y: v2Position.y.value
  }));

  // ANIMATION
  // Edge render animation progress
  const animationProgress = useSharedValue(0);

  const sharedProps = {
    animationProgress,
    removed
  };

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

  const renderEdge = () =>
    areDirectedEdgeComponentProps(props) ? (
      <DirectedEdgeComponent<E, V>
        edge={props.edge}
        from={p1}
        to={p2}
        vertexRadius={vertexRadius}
        renderers={props.renderers}
        settings={props.settings}
        {...sharedProps}
      />
    ) : (
      <UndirectedEdgeComponent<E, V>
        edge={props.edge}
        points={[p1, p2]}
        renderers={props.renderers}
        settings={props.settings}
        {...sharedProps}
      />
    );

  return (
    <>
      {renderEdge()}
      {props.renderers.label && (
        <EdgeLabelComponent
          edge={edge}
          vertexRadius={vertexRadius}
          v1Position={v1Position}
          v2Position={v2Position}
          renderer={props.renderers.label}
          {...sharedProps}
        />
      )}
    </>
  );
}

export default memo(EdgeComponent) as <E, V>(
  props: EdgeComponentProps<E, V>
) => JSX.Element;

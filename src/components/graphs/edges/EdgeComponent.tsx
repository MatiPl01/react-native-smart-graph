import { memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

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
  const { edge, v1Position, v2Position, vertexRadius } = props;

  const p1 = useDerivedValue(
    () => ({ x: v1Position.x.value || 0, y: v1Position.y.value || 0 }),
    [v1Position.x, v1Position.y]
  );

  const p2 = useDerivedValue(
    () => ({ x: v2Position.x.value || 0, y: v2Position.y.value || 0 }),
    [v2Position.x, v2Position.y]
  );

  const renderEdge = () =>
    areDirectedEdgeComponentProps(props) ? (
      <DirectedEdgeComponent<E, V>
        edge={props.edge}
        from={p1}
        to={p2}
        vertexRadius={vertexRadius}
        renderers={props.renderers}
        settings={props.settings}
      />
    ) : (
      <UndirectedEdgeComponent<E, V>
        edge={props.edge}
        points={[p1, p2]}
        renderers={props.renderers}
        settings={props.settings}
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
        />
      )}
    </>
  );
}

export default memo(EdgeComponent) as <E, V>(
  props: EdgeComponentProps<E, V>
) => JSX.Element;

import { memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { DirectedEdge, UndirectedEdge } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
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
  verticesPositions: Record<string, AnimatedPositionCoordinates>;
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
  const { edge, verticesPositions, vertexRadius } = props;
  const [v1, v2] = edge.vertices;
  const v1Position = verticesPositions[v1.key];
  const v2Position = verticesPositions[v2.key];

  const p1 = useDerivedValue(
    () => ({ x: v1Position?.x.value || 0, y: v1Position?.y.value || 0 }),
    [v1Position?.x, v1Position?.y]
  );

  const p2 = useDerivedValue(
    () => ({ x: v2Position?.x.value || 0, y: v2Position?.y.value || 0 }),
    [v2Position?.x, v2Position?.y]
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
          verticesPositions={verticesPositions}
          renderer={props.renderers.label}
        />
      )}
    </>
  );
}

export default memo(EdgeComponent) as <E, V>(
  props: EdgeComponentProps<E, V>
) => JSX.Element;

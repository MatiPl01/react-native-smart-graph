import { DirectedEdge } from '@/types/graphs';
import { AnimatedPosition } from '@/types/layout';
import { DirectedEdgeRenderers } from '@/types/renderer';
import { DirectedGraphComponentsSettings } from '@/types/settings';

import EdgeArrowComponent from '../arrows/EdgeArrowComponent';

type DirectedEdgeComponentProps<E, V> = {
  edge: DirectedEdge<E, V>;
  from: AnimatedPosition;
  to: AnimatedPosition;
  vertexRadius: number;
  renderers: DirectedEdgeRenderers<E>;
  settings?: DirectedGraphComponentsSettings['edge'];
};

export default function DirectedEdgeComponent<E, V>({
  edge,
  from,
  to,
  vertexRadius,
  renderers: { edge: edgeRenderer, arrow: edgeArrowRenderer },
  settings
}: DirectedEdgeComponentProps<E, V>) {
  return (
    <>
      {edgeRenderer({
        key: edge.key,
        data: edge.value,
        from,
        to
      })}
      <EdgeArrowComponent
        from={from}
        to={to}
        vertexRadius={vertexRadius}
        renderer={edgeArrowRenderer}
        settings={settings?.arrow}
      />
    </>
  );
}

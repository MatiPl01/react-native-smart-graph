import { DirectedEdge } from '@/types/graphs';
import { AnimatedVector } from '@/types/layout';
import { DirectedEdgeRenderers, SharedRenderersProps } from '@/types/renderer';
import { DirectedGraphComponentsSettings } from '@/types/settings';

import EdgeArrowComponent from '../arrows/EdgeArrowComponent';

type DirectedEdgeComponentProps<E, V> = SharedRenderersProps & {
  edge: DirectedEdge<E, V>;
  from: AnimatedVector;
  to: AnimatedVector;
  vertexRadius: number;
  renderers: DirectedEdgeRenderers<E>;
  settings?: DirectedGraphComponentsSettings['edge'];
};

export default function DirectedEdgeComponent<E, V>({
  edge,
  vertexRadius,
  renderers: { edge: edgeRenderer, arrow: edgeArrowRenderer },
  settings,
  ...sharedProps
}: DirectedEdgeComponentProps<E, V>) {
  return (
    <>
      {edgeRenderer({
        key: edge.key,
        data: edge.value,
        ...sharedProps
      })}
      <EdgeArrowComponent
        vertexRadius={vertexRadius}
        renderer={edgeArrowRenderer}
        settings={settings?.arrow}
        {...sharedProps}
      />
    </>
  );
}

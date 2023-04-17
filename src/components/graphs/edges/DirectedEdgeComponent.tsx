import { SharedValue } from 'react-native-reanimated';

import { DirectedEdge } from '@/types/graphs';
import { DirectedEdgeRenderers } from '@/types/renderer';
import { DirectedEdgeSettings } from '@/types/settings';

import EdgeArrowComponent from '../arrows/EdgeArrowComponent';

type DirectedEdgeComponentProps<E, V> = {
  edge: DirectedEdge<E, V>;
  from: SharedValue<{ x: number; y: number }>;
  to: SharedValue<{ x: number; y: number }>;
  renderers: DirectedEdgeRenderers<E>;
  settings?: DirectedEdgeSettings;
};

export default function DirectedEdgeComponent<E, V>({
  edge,
  from,
  to,
  renderers: {
    edge: edgeRenderer,
    arrow: edgeArrowRenderer,
    label: edgeLabelRenderer
  },
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
        vertexRadius={edge.target.radius}
        renderer={edgeArrowRenderer}
        settings={settings?.arrow}
      />
    </>
  );
}

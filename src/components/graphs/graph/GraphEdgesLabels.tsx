import EdgeLabelComponent from '@/components/graphs/labels/EdgeLabelComponent';
import { useVertexFocusContext, withGraphData } from '@/providers/graph';
import { EdgeLabelComponentData } from '@/types/components/edgeLabels';

type GraphEdgeLabelsProps<E> = {
  edgeLabelsData: Record<string, EdgeLabelComponentData<E>>;
};

function GraphEdgeLabels<E>({ edgeLabelsData }: GraphEdgeLabelsProps<E>) {
  const focusContextValue = useVertexFocusContext();

  return Object.entries(edgeLabelsData).map(([key, data]) => (
    <EdgeLabelComponent
      edgeKey={key}
      key={key}
      {...focusContextValue}
      {...data}
    />
  ));
}

export default withGraphData(GraphEdgeLabels, ({ edgeLabelsData }) => ({
  edgeLabelsData
}));

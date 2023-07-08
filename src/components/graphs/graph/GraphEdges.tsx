import EdgeComponent from '@/components/graphs/edges/EdgeComponent';
import { useVertexFocusContext, withGraphData } from '@/providers/graph';
import {
  EdgeComponentData,
  EdgeComponentProps,
  EdgeRemoveHandler,
  EdgeRenderHandler
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';

type GraphEdgesProps<
  E,
  V,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = {
  edgesData: Record<string, EdgeComponentData<E, V, ED>>;
  handleEdgeRemove: EdgeRemoveHandler;
  handleEdgeRender: EdgeRenderHandler;
};

function GraphEdges<
  E,
  V,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  edgesData,
  handleEdgeRemove,
  handleEdgeRender
}: GraphEdgesProps<E, V, ED>) {
  const focusContextValue = useVertexFocusContext();

  return Object.values(edgesData).map(data => (
    <EdgeComponent
      {...({
        ...data,
        ...focusContextValue,
        key: data.edge.key,
        onRemove: handleEdgeRemove,
        onRender: handleEdgeRender
      } as unknown as EdgeComponentProps<E, V>)}
    />
  ));
}

export default withGraphData(
  GraphEdges,
  ({ edgesData, handleEdgeRemove, handleEdgeRender }) => ({
    edgesData,
    handleEdgeRemove,
    handleEdgeRender
  })
);

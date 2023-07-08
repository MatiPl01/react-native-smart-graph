/* eslint-disable import/no-unused-modules */
import { Mask } from '@shopify/react-native-skia';

import { AnimatedBoundingRect } from '@/types/layout';

import GraphEdges from './GraphEdges';
import GraphEdgesLabels from './GraphEdgesLabels';
import GraphEdgesMask from './GraphEdgesMask';
import GraphVertices from './GraphVertices';

export type GraphComponentPrivateProps = {
  boundingRect: AnimatedBoundingRect;
};

function GraphComponent({ boundingRect }: GraphComponentPrivateProps) {
  return (
    <>
      <Mask
        mask={<GraphEdgesMask boundingRect={boundingRect} />}
        mode='luminance'>
        <GraphEdges />
      </Mask>
      <GraphVertices />
      <GraphEdgesLabels />
    </>
  );
}

export default GraphComponent as () => JSX.Element;

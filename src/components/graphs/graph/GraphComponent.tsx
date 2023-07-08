/* eslint-disable import/no-unused-modules */
import { Group } from '@shopify/react-native-skia';

import GraphEdges from './GraphEdges';
import GraphVertices from './GraphVertices';

export default function GraphComponent() {
  console.log('GraphComponent');
  return (
    <Group>
      <GraphEdges />
      <GraphVertices />
    </Group>
  );
}

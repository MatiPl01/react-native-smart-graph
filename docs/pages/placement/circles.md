# Circles placement strategy

## Description

Circles placement strategy is very **similar** to the [circle](pages/placement/circle.md) placement strategy described on the previous page. The **only difference** is that it places **vertices from disjoint graphs** on **separate circles**. These **circles** are positioned **next to each other** then.

> [!NOTE]
> This strategy always gives **the same** result for **directed and undirected** graphs.

## Properties

All properties are the same as for the [circle](pages/placement/circle?id=properties) placement strategy.

## Example

**Example code (`CirclesPlacementExample`)**

```tsx
import { useMemo } from 'react';
import { useWorkletCallback } from 'react-native-reanimated';
import {
  GraphView,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' },
    { key: 'V9' }
  ],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V3', to: 'V1' },
    { key: 'E4', from: 'V5', to: 'V6' },
    { key: 'E5', from: 'V1', to: 'V3' },
    { key: 'E6', from: 'V1', to: 'V4' },
    { key: 'E7', from: 'V5', to: 'V7' },
    { key: 'E8', from: 'V2', to: 'V8' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const sortComparator = useWorkletCallback(
    (a: string, b: string) => b.localeCompare(a),
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'circles',
            minVertexSpacing: 150,
            sortVertices: true,
            sortComparator
          }
          // --- End of placement settings ---
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

**Result**

<video src="./assets/videos/placement/circles/placement-example.mp4" style="width: 300px"></video>

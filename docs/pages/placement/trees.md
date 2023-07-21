# Trees placement strategy

## Description

Trees placement strategy is best suited for graphs that should be rendered as **trees** (have one vertex with no ingoing edges).

If used with disjoint graphs, disjoint graph components will form separate trees placed next to each other.

> [!NOTE]
> This strategy gives different results for **directed and undirected** graphs. In **directed graphs**, since edges **point from one node to another**, they shape the graph's appearance or layout. On the other hand, **undirected graphs**, where edges have **no fixed direction**, yield a different, more evenly distributed layout.

## Properties

<!-- TODO -->

## Root vertex

## Example

<!-- tabs:start -->

#### **Directed graph**

**Example code (`DirectedGraphTreesPlacementExample`)**

```tsx
import { useMemo } from 'react';
import {
  GraphView,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const SMALL_TREE = {
  vertices: [{ key: 'SV1' }, { key: 'SV2' }, { key: 'SV3' }, { key: 'SV4' }],
  edges: [
    { key: 'SE1', from: 'SV1', to: 'SV2' },
    { key: 'SE2', from: 'SV1', to: 'SV3' },
    { key: 'SE3', from: 'SV1', to: 'SV4' }
  ]
};

const LARGE_TREE = {
  vertices: [
    { key: 'LV1' },
    { key: 'LV2' },
    { key: 'LV3' },
    { key: 'LV4' },
    { key: 'LV5' },
    { key: 'LV6' },
    { key: 'LV7' },
    { key: 'LV8' }
  ],
  edges: [
    { key: 'LE1', from: 'LV1', to: 'LV2' },
    { key: 'LE2', from: 'LV2', to: 'LV3' },
    { key: 'LE3', from: 'LV2', to: 'LV4' },
    { key: 'LE4', from: 'LV2', to: 'LV5' },
    { key: 'LE5', from: 'LV5', to: 'LV6' },
    { key: 'LE6', from: 'LV1', to: 'LV7' },
    { key: 'LE7', from: 'LV5', to: 'LV8' }
  ]
};

const COMBINED_GRAPH: DirectedGraphData = {
  vertices: [...SMALL_TREE.vertices, ...LARGE_TREE.vertices],
  edges: [...SMALL_TREE.edges, ...LARGE_TREE.edges]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(COMBINED_GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'trees',
            minVertexSpacing: 100
          }
          // --- End of placement settings ---
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

**Expected result**

<video src="./assets/videos/placement/trees/directed-graph.mp4" style="width: 300px"></video>

#### **Undirected Graph**

**Example code (`UndirectedGraphTreesPlacementExample`)**

```tsx
import { useMemo } from 'react';
import {
  GraphView,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent
} from 'react-native-smart-graph';

const SMALL_TREE = {
  vertices: [{ key: 'SV1' }, { key: 'SV2' }, { key: 'SV3' }, { key: 'SV4' }],
  edges: [
    { key: 'SE1', vertices: ['SV1', 'SV2'] },
    { key: 'SE2', vertices: ['SV1', 'SV3'] },
    { key: 'SE3', vertices: ['SV1', 'SV4'] }
  ]
};

const LARGE_TREE = {
  vertices: [
    { key: 'LV1' },
    { key: 'LV2' },
    { key: 'LV3' },
    { key: 'LV4' },
    { key: 'LV5' },
    { key: 'LV6' },
    { key: 'LV7' },
    { key: 'LV8' }
  ],
  edges: [
    { key: 'LE1', vertices: ['LV1', 'LV2'] },
    { key: 'LE2', vertices: ['LV2', 'LV3'] },
    { key: 'LE3', vertices: ['LV2', 'LV4'] },
    { key: 'LE4', vertices: ['LV2', 'LV5'] },
    { key: 'LE5', vertices: ['LV5', 'LV6'] },
    { key: 'LE6', vertices: ['LV1', 'LV7'] },
    { key: 'LE7', vertices: ['LV5', 'LV8'] }
  ]
};

const COMBINED_GRAPH: UndirectedGraphData = {
  vertices: [...SMALL_TREE.vertices, ...LARGE_TREE.vertices],
  edges: [...SMALL_TREE.edges, ...LARGE_TREE.edges]
};

export default function Graph() {
  const graph = useMemo(() => new UndirectedGraph(COMBINED_GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <UndirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'trees',
            minVertexSpacing: 100
          }
          // --- End of placement settings ---
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

**Expected result**

<video src="./assets/videos/placement/trees/undirected-graph.mp4" style="width: 300px"></video>

<!-- tabs:end -->

> [!NOTE]
> In both examples above the same graph gives different results. That's because for the undirected graph the root vertex is chosen in such a way that the graph is most balanced.

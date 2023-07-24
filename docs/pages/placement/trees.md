# Trees placement strategy

## Description

Trees placement strategy is best suited for graphs that should be rendered as **trees** (have one vertex with no ingoing edges).

If used with disjoint graphs, **disjoint graph components** will form **separate trees** placed next to each other.

> [!NOTE]
> This strategy can give different results for **directed and undirected** graphs. In **directed graphs**, since edges **point from one node to another**, they shape the graph's appearance or layout. On the other hand, **undirected graphs**, where edges have **no fixed direction**, yield a different, more evenly distributed layout.

## Properties

#### `strategy`

A required field specifying the strategy to use.

| Type    | Default | Required |
| ------- | ------- | -------- |
| 'trees' | -       | yes      |

#### `minVertexSpacing`

Specifies the minimum distance between vertices.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 20      | no       |

#### `roots`

Specifies which **vertices** should be **used as tree roots**. This property takes an **array of vertices keys** which is useful if the graph is disjoint and allows specifying roots of each separate graph component.

| Type     | Default | Required |
| -------- | ------- | -------- |
| string[] | -       | no       |

## Root vertices

This section explains the **root vertex selection algorithm**. If the graph is disjoint, the same logic applies to each separate graph component.

Steps outlined below follow a priority order. If the algorithm fails to select a root vertex using a current step, it will attempt to do so using the subsequent step. The algorithm is different for directed and undirected graphs.

<!-- tabs:start -->

#### **Directed graph**

1. Iterate over the keys of vertices present in the current graph component verifying if a vertex appears in the roots array. If the **roots array** is **supplied and contains a vertex**, return this vertex key,

2. Create a **list of candidates** for a root vertex. Find all **vertices with no incoming edges** and save this list as a list of candidates. **If the list is empty**, treat **all vertices** of the graph component as candidates,

3. From the list of candidates select a vertex with the **highest number of outgoing edges**.

#### **Undirected Graph**

1. Iterate over the keys of vertices present in the current graph component, verifying if a vertex appears in the roots array. If the **roots array** is **supplied and contains a vertex**, return this vertex key,

2. Find a vertex that is **the center of the graph component**. Essentially, this center vertex is located at the **midpoint of the graph's diameter**, which is **the longest path connecting two vertices**.

<!-- tabs:end -->

## Example

<!-- TODO - add link to tke graph events section -->

The example below is an example allowing to choose a root on vertex press. It demonstrates how the graph structure will be rendered when a **custom root vertex** is selected. The example uses **graph events** described in detail in [this]() section.

**Code snippets**

<!-- tabs:start -->

#### **Directed graph**

```tsx
...

export default function Graph() {
  ...
  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          ...
          placement: {
            strategy: 'trees',
            roots: [smallTreeRoot, largeTreeRoot],
            minVertexSpacing: 50
          },
          ...
        }}
        ...
      />
    </GraphView>
  );
}
```

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useCallback, useMemo, useState } from 'react';
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent,
  DirectedGraphData,
  VertexPressHandler
} from 'react-native-smart-graph';

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

const SMALL_TREE = {
  vertices: [{ key: 'SV1' }, { key: 'SV2' }, { key: 'SV3' }, { key: 'SV4' }],
  edges: [
    { key: 'SE1', from: 'SV1', to: 'SV2' },
    { key: 'SE2', from: 'SV1', to: 'SV3' },
    { key: 'SE3', from: 'SV1', to: 'SV4' }
  ]
};

const COMBINED_GRAPH: DirectedGraphData = {
  vertices: [...SMALL_TREE.vertices, ...LARGE_TREE.vertices],
  edges: [...SMALL_TREE.edges, ...LARGE_TREE.edges]
};

export default function Graph() {
  const [smallTreeRoot, setSmallTreeRoot] = useState('');
  const [largeTreeRoot, setLargeTreeRoot] = useState('');

  const graph = useMemo(() => new DirectedGraph(COMBINED_GRAPH), []);

  const handleVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      if (key.startsWith('SV')) {
        setSmallTreeRoot(key);
      } else {
        setLargeTreeRoot(key);
      }
    },
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'trees',
            roots: [smallTreeRoot, largeTreeRoot],
            minVertexSpacing: 50
          },
          // --- End of placement settings ---
          events: {
            onVertexPress: handleVertexPress
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

<!-- accordion:end -->

#### **Undirected Graph**

```tsx
...

export default function Graph() {
  ...
  return (
    <GraphView objectFit='contain' padding={50}>
      <UndirectedGraphComponent
        settings={{
          ...
          placement: {
            strategy: 'trees',
            roots: [smallTreeRoot, largeTreeRoot],
            minVertexSpacing: 50
          },
          ...
        }}
        ...
      />
    </GraphView>
  );
}
```

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useCallback, useMemo, useState } from 'react';
import {
  GraphView,
  VertexPressHandler,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent
} from 'react-native-smart-graph';

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

const SMALL_TREE = {
  vertices: [{ key: 'SV1' }, { key: 'SV2' }, { key: 'SV3' }, { key: 'SV4' }],
  edges: [
    { key: 'SE1', vertices: ['SV1', 'SV2'] },
    { key: 'SE2', vertices: ['SV1', 'SV3'] },
    { key: 'SE3', vertices: ['SV1', 'SV4'] }
  ]
};

const COMBINED_GRAPH: UndirectedGraphData = {
  vertices: [...SMALL_TREE.vertices, ...LARGE_TREE.vertices],
  edges: [...SMALL_TREE.edges, ...LARGE_TREE.edges]
};

export default function Graph() {
  const [smallTreeRoot, setSmallTreeRoot] = useState('');
  const [largeTreeRoot, setLargeTreeRoot] = useState('');

  const graph = useMemo(() => new UndirectedGraph(COMBINED_GRAPH), []);

  const handleVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      if (key.startsWith('SV')) {
        setSmallTreeRoot(key);
      } else {
        setLargeTreeRoot(key);
      }
    },
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <UndirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'trees',
            roots: [smallTreeRoot, largeTreeRoot],
            minVertexSpacing: 50
          },
          // --- End of placement settings ---
          events: {
            onVertexPress: handleVertexPress
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

<!-- accordion:end -->

<!-- tabs:end -->

**Result**

<!-- tabs:start -->

#### **Directed Graph**

<video src="./assets/videos/placement/trees/trees-directed-placement-example.mp4" style="width: 300px"></video>

#### **Undirected Graph**

<video src="./assets/videos/placement/trees/trees-undirected-placement-example.mp4" style="width: 300px"></video>

<!-- tabs:end -->

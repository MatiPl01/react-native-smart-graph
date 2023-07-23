# Circles placement strategy

## Description

Circles placement strategy is very **similar** to the [circle](pages/placement/circle.md) placement strategy described on the previous page. The **only difference** is that it places **vertices from disjoint graphs** on **separate circles**. These **circles** are positioned **next to each other** then.

> [!NOTE]
> This strategy always gives **the same** result for **directed and undirected** graphs.

## Properties

> All properties (except the `strategy`) are the same as for the [circle](pages/placement/circle?id=properties) placement strategy.

#### `strategy`

A required field specifying the strategy to use.

| Type      | Default | Required |
| --------- | ------- | -------- |
| 'circles' | -       | yes      |

#### `minVertexSpacing`

Specifies the minimum distance between vertices.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 20      | no       |

#### `sortVertices`

Determines whether graph vertices should be arranged in a circular layout based on specific relative order. Vertices will be sorted separately for each circle (each graph component).

| Type    | Default | Required |
| ------- | ------- | -------- |
| boolean | false   | no       |

> [!NOTE]
> If this property is set to `true` without specifying the custom `sortComparator`, vertices will be sorted by their keys in a non-decreasing order.

#### `sortComparator`

Specifies how vertices should be ordered on each circle. The function must be a reanimated `'worklet'`, because all layout calculations are processed on the UI thread.

Below is the default implementation of the `sortComparator` function:

```ts
const defaultSortComparator = (key1: string, key2: string) => {
  'worklet';
  return key1.localeCompare(key2);
};
```

| Type                                   | Default               | Required |
| -------------------------------------- | --------------------- | -------- |
| (key1: string, key2: string) => number | defaultSortComparator | no       |

## Example

**Code snippet**

```tsx
...
import { useWorkletCallback } from 'react-native-reanimated';

export default function Graph() {
  ...
  const sortComparator = useWorkletCallback(
    (a: string, b: string) => b.localeCompare(a),
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          ...
          placement: {
            strategy: 'circles',
            minVertexSpacing: 150,
            sortVertices: true,
            sortComparator
          }
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

<!-- accordion:end -->

**Result**

<img src="./assets/images/placement/circles/placement-example.png" alt="circles placement example" width="300" />

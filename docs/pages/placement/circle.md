# Circle placement strategy

Circle placement strategy renders all graph vertices on a **single circle**. It **ignores connections between vertices**, so disconnected vertices will be displayed on the same circle as vertices which are connected to each other.

## Properties

All properties listed below should be passed in the graph component `settings` object as described in [this](pages/placement/index?id=usage) section.

#### `strategy`

A required field specifying the strategy to use.

| Type     | Default | Required |
| -------- | ------- | -------- |
| 'string' | -       | yes      |

#### `minVertexSpacing`

Specifies the minimum distance between vertices.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 20      | no       |

#### `sortVertices`

Determines whether graph vertices should be arranged in a circular layout based on specific relative order.

| Type    | Default | Required |
| ------- | ------- | -------- |
| boolean | false   | no       |

> [!NOTE]
> If this property is set to `true` without specifying the custom `sortComparator`, vertices will be sorted by their keys in a non-decreasing order.

#### `sortComparator`

Specifies how vertices should be ordered on the circle. The function must be a reanimated `'worklet'`, because all layout calculations are processed on the UI thread.

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

<details>
<summary>Examples</summary>
<article>
<table>
  <tr>
    <th>Default sort comparator (non-decreasing order)</th>
    <th>Custom sort comparator (non-increasing order)</th>
  </tr>
  <tr>
    <td><img src="/assets/images/placement/circle/sort-comparator-default.png"></img></td>
    <td><img src="/assets/images/placement/circle/sort-comparator-custom.png"></img></td>
  </tr>
</table>
</article>
</details>

## Example

**Example code (`CirclePlacementExample`)**

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
    { key: 'V7' }
  ],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V3', to: 'V1' },
    { key: 'E4', from: 'V4', to: 'V5' },
    { key: 'E5', from: 'V5', to: 'V6' },
    { key: 'E6', from: 'V1', to: 'V3' },
    { key: 'E7', from: 'V1', to: 'V4' }
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
            strategy: 'circle',
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

<video src="/assets/videos/placement/circle/placement-example.mp4" style="width: 300px"></video>

> [!NOTE]
> The result will always be **the same** for **directed and undirected** graphs. That's why there is no example for the undirected graph.

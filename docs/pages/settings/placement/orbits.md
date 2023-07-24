# Orbits placement strategy

## Description

Orbits placement strategy works similarly to the [trees](pages/settings/placement/trees) placement strategy. It looks for the root vertex, and distributes other vertices relatively to the selected root.

Every vertex connected with the root will be placed on the first orbit (circle around the root). All children of these vertices will be positioned on the next orbit, and so on.

> [!NOTE]
> This strategy can give different results for **directed and undirected** graphs. In **directed graphs**, since edges **point from one node to another**, they shape the graph's appearance or layout. On the other hand, **undirected graphs**, where edges have **no fixed direction**, yield a different, more evenly distributed layout.

### Explanation

- **Orbits** - circles around the root vertex,

  | Visualization                                                                                   | Description                                                                                                                                                                                                                                       |
  | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | <img src="./assets/images/placement/orbits/explanation-orbits.png" alt="orbits explanation"  /> | Dashed circles on the image in the left column show consecutive **orbits**. The root vertex (**V01**) was automatically selected (a vertex with no incoming edges), and all its **descendants** are distributed on **orbits around** this vertex. |

- **Sectors** - areas where vertices connected to the root vertex will be placed with their subtrees,

  <table>
    <tr>
      <th>Visualization</th>
      <th>Description</th>
    </tr>
    <tr>
      <td><img src="./assets/images/placement/orbits/explanation-sectors.png" alt="sectors explanation"  /> </td>
      <td>
        <p>
          Areas with different background colors represent different sectors. Each vertex connected to the root will have its <strong>own sector</strong>. The <strong>size of the sector</strong> depends on <strong>how sparse the subtree</strong> is.
        </p>
        <p>
          Sectors are further divided into smaller sectors. For example, the <strong>V02</strong> vertex is the root of its subtree and its sector is divided into 2 sectors, one for the <strong>V07</strong> vertex, and the other for the <strong>V08</strong> vertex.
        </p>
      </td>
    </tr>
  </table>

## Properties

#### `strategy`

A required field specifying the strategy to use.

| Type     | Default | Required |
| -------- | ------- | -------- |
| 'orbits' | -       | yes      |

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

#### `layerSizing`

This property has an impact on the layer radius calculation logic.

| Type                                                                                   | Default | Required |
| -------------------------------------------------------------------------------------- | ------- | -------- |
| 'auto' &#124; 'equal' &#124; 'non-decreasing' &#124; 'quad-increasing' &#124; 'custom' | 'auto'  | no       |

> [!NOTE]
> The `'custom'` layer sizing requires the [getLayerRadius](pages/settings/placement/orbits?id=getlayerradius) property described below.

#### `getLayerRadius`

A worklet function that is used for layer radiuses calculation.

| Type                                                                                        | Default | Required |
| ------------------------------------------------------------------------------------------- | ------- | -------- |
| props: { layerIndex: number; layersCount: number; previousLayerRadius: number; }) => number | -       | yes\*    |

\*Required only for the `'custom'` layer sizing.

#### `maxSectorAngle`

Sets the maximum angle of the sector (if you don't know what is a sector, see this [explanation](/pages/settings/placement/orbits?id=explanation)). The angle should be specified in radians.

| Type   | Default       | Required |
| ------ | ------------- | -------- |
| number | 2/3 ⋅ Math.PI | no       |

<!-- accordion:start -->

#### _Examples_

| 2/3 ⋅ Math.PI (default)                                                                                            | 1/2 ⋅ Math.PI                                                                                                  | 1/4 ⋅ Math.PI                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| <img src="./assets/images/placement/orbits/example-sector-angle-default.png" alt="default sector angle example" /> | <img src="./assets/images/placement/orbits/example-sector-angle-quarter.png" alt="1/4 sector angle example" /> | <img src="./assets/images/placement/orbits/example-sector-angle-one-eighth.png" alt="1/8 sector angle example" /> |

<!-- accordion:end -->

#### `symmetrical`

Indicates whether placement should be symmetrical around the root vertex.

If this property is set to `true` (default), padding will be added to the graph container in such a way that the root vertex is in the center of this container (this padding is not related to the `GraphView` component [padding](pages/components/view?id=padding)).

| Type    | Default | Required |
| ------- | ------- | -------- |
| boolean | true    | no       |

<!-- accordion:start -->

#### _Examples_

| true (default)                                                                                        | false                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| <img src="./assets/images/placement/orbits/example-symmetrical-true.png" alt="symmetrical example" /> | <img src="./assets/images/placement/orbits/example-symmetrical-false.png" alt="non-symmetrical example" /> |

<!-- accordion:end -->

## Root vertices

> The logic is **the same** as for the [trees](pages/settings/placement/trees?id=root-vertices) placement strategy.

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

## Examples

### Layer sizing

Examples below include code snippets for different layer sizings and show expected results.

**Code snippets**

<!-- tabs:start -->

#### **auto**

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
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'auto' // <- doesn't have to be explicitly specified (it's a default option)
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
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const ORBITS_GRAPH = {
  vertices: [
    { key: 'V0' }, // root
    // First orbit vertices
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    // Second orbit vertices
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' },
    { key: 'V9' },
    { key: 'V10' },
    { key: 'V11' },
    { key: 'V12' },
    { key: 'V13' },
    { key: 'V14' },
    { key: 'V15' },
    // Third orbit vertices
    { key: 'V16' },
    { key: 'V17' },
    { key: 'V18' },
    { key: 'V19' },
    { key: 'V20' },
    { key: 'V21' },
    { key: 'V22' },
    { key: 'V23' },
    { key: 'V24' }
  ],
  edges: [
    // Edges from root to first orbit
    { key: 'E0', from: 'V0', to: 'V1' },
    { key: 'E1', from: 'V0', to: 'V2' },
    { key: 'E2', from: 'V0', to: 'V3' },
    { key: 'E3', from: 'V0', to: 'V4' },
    { key: 'E4', from: 'V0', to: 'V5' },
    // Edges from first orbit to second orbit
    // V1 has 1 child
    { key: 'E5', from: 'V1', to: 'V6' },
    // V2 has 2 children
    { key: 'E6', from: 'V2', to: 'V7' },
    { key: 'E7', from: 'V2', to: 'V8' },
    // V3 has 3 children
    { key: 'E8', from: 'V3', to: 'V9' },
    { key: 'E9', from: 'V3', to: 'V10' },
    { key: 'E10', from: 'V3', to: 'V11' },
    // V4 has 4 children
    { key: 'E11', from: 'V4', to: 'V12' },
    { key: 'E12', from: 'V4', to: 'V13' },
    { key: 'E13', from: 'V4', to: 'V14' },
    { key: 'E14', from: 'V4', to: 'V15' },
    // Edges from second orbit to third orbit
    { key: 'E15', from: 'V6', to: 'V16' },
    { key: 'E16', from: 'V7', to: 'V17' },
    { key: 'E17', from: 'V7', to: 'V18' },
    { key: 'E18', from: 'V9', to: 'V19' },
    { key: 'E19', from: 'V10', to: 'V20' },
    { key: 'E20', from: 'V11', to: 'V21' },
    { key: 'E21', from: 'V12', to: 'V22' },
    { key: 'E22', from: 'V13', to: 'V23' },
    { key: 'E23', from: 'V14', to: 'V24' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(ORBITS_GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'auto' // <- doesn't have to be explicitly specified (it's a default option)
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

#### **equal**

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
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'equal'
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
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const ORBITS_GRAPH = {
  vertices: [
    { key: 'V0' }, // root
    // First orbit vertices
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    // Second orbit vertices
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' },
    { key: 'V9' },
    { key: 'V10' },
    { key: 'V11' },
    { key: 'V12' },
    { key: 'V13' },
    { key: 'V14' },
    { key: 'V15' },
    // Third orbit vertices
    { key: 'V16' },
    { key: 'V17' },
    { key: 'V18' },
    { key: 'V19' },
    { key: 'V20' },
    { key: 'V21' },
    { key: 'V22' },
    { key: 'V23' },
    { key: 'V24' }
  ],
  edges: [
    // Edges from root to first orbit
    { key: 'E0', from: 'V0', to: 'V1' },
    { key: 'E1', from: 'V0', to: 'V2' },
    { key: 'E2', from: 'V0', to: 'V3' },
    { key: 'E3', from: 'V0', to: 'V4' },
    { key: 'E4', from: 'V0', to: 'V5' },
    // Edges from first orbit to second orbit
    // V1 has 1 child
    { key: 'E5', from: 'V1', to: 'V6' },
    // V2 has 2 children
    { key: 'E6', from: 'V2', to: 'V7' },
    { key: 'E7', from: 'V2', to: 'V8' },
    // V3 has 3 children
    { key: 'E8', from: 'V3', to: 'V9' },
    { key: 'E9', from: 'V3', to: 'V10' },
    { key: 'E10', from: 'V3', to: 'V11' },
    // V4 has 4 children
    { key: 'E11', from: 'V4', to: 'V12' },
    { key: 'E12', from: 'V4', to: 'V13' },
    { key: 'E13', from: 'V4', to: 'V14' },
    { key: 'E14', from: 'V4', to: 'V15' },
    // Edges from second orbit to third orbit
    { key: 'E15', from: 'V6', to: 'V16' },
    { key: 'E16', from: 'V7', to: 'V17' },
    { key: 'E17', from: 'V7', to: 'V18' },
    { key: 'E18', from: 'V9', to: 'V19' },
    { key: 'E19', from: 'V10', to: 'V20' },
    { key: 'E20', from: 'V11', to: 'V21' },
    { key: 'E21', from: 'V12', to: 'V22' },
    { key: 'E22', from: 'V13', to: 'V23' },
    { key: 'E23', from: 'V14', to: 'V24' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(ORBITS_GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'equal'
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

#### **non-decreasing**

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
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'non-decreasing'
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
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const ORBITS_GRAPH = {
  vertices: [
    { key: 'V0' }, // root
    // First orbit vertices
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    // Second orbit vertices
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' },
    { key: 'V9' },
    { key: 'V10' },
    { key: 'V11' },
    { key: 'V12' },
    { key: 'V13' },
    { key: 'V14' },
    { key: 'V15' },
    // Third orbit vertices
    { key: 'V16' },
    { key: 'V17' },
    { key: 'V18' },
    { key: 'V19' },
    { key: 'V20' },
    { key: 'V21' },
    { key: 'V22' },
    { key: 'V23' },
    { key: 'V24' }
  ],
  edges: [
    // Edges from root to first orbit
    { key: 'E0', from: 'V0', to: 'V1' },
    { key: 'E1', from: 'V0', to: 'V2' },
    { key: 'E2', from: 'V0', to: 'V3' },
    { key: 'E3', from: 'V0', to: 'V4' },
    { key: 'E4', from: 'V0', to: 'V5' },
    // Edges from first orbit to second orbit
    // V1 has 1 child
    { key: 'E5', from: 'V1', to: 'V6' },
    // V2 has 2 children
    { key: 'E6', from: 'V2', to: 'V7' },
    { key: 'E7', from: 'V2', to: 'V8' },
    // V3 has 3 children
    { key: 'E8', from: 'V3', to: 'V9' },
    { key: 'E9', from: 'V3', to: 'V10' },
    { key: 'E10', from: 'V3', to: 'V11' },
    // V4 has 4 children
    { key: 'E11', from: 'V4', to: 'V12' },
    { key: 'E12', from: 'V4', to: 'V13' },
    { key: 'E13', from: 'V4', to: 'V14' },
    { key: 'E14', from: 'V4', to: 'V15' },
    // Edges from second orbit to third orbit
    { key: 'E15', from: 'V6', to: 'V16' },
    { key: 'E16', from: 'V7', to: 'V17' },
    { key: 'E17', from: 'V7', to: 'V18' },
    { key: 'E18', from: 'V9', to: 'V19' },
    { key: 'E19', from: 'V10', to: 'V20' },
    { key: 'E20', from: 'V11', to: 'V21' },
    { key: 'E21', from: 'V12', to: 'V22' },
    { key: 'E22', from: 'V13', to: 'V23' },
    { key: 'E23', from: 'V14', to: 'V24' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(ORBITS_GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'non-decreasing'
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

#### **quad-increasing**

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
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'quad-increasing'
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
import {
  GraphView,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const ORBITS_GRAPH = {
  vertices: [
    { key: 'V0' }, // root
    // First orbit vertices
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    // Second orbit vertices
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' },
    { key: 'V9' },
    { key: 'V10' },
    { key: 'V11' },
    { key: 'V12' },
    { key: 'V13' },
    { key: 'V14' },
    { key: 'V15' },
    // Third orbit vertices
    { key: 'V16' },
    { key: 'V17' },
    { key: 'V18' },
    { key: 'V19' },
    { key: 'V20' },
    { key: 'V21' },
    { key: 'V22' },
    { key: 'V23' },
    { key: 'V24' }
  ],
  edges: [
    // Edges from root to first orbit
    { key: 'E0', from: 'V0', to: 'V1' },
    { key: 'E1', from: 'V0', to: 'V2' },
    { key: 'E2', from: 'V0', to: 'V3' },
    { key: 'E3', from: 'V0', to: 'V4' },
    { key: 'E4', from: 'V0', to: 'V5' },
    // Edges from first orbit to second orbit
    // V1 has 1 child
    { key: 'E5', from: 'V1', to: 'V6' },
    // V2 has 2 children
    { key: 'E6', from: 'V2', to: 'V7' },
    { key: 'E7', from: 'V2', to: 'V8' },
    // V3 has 3 children
    { key: 'E8', from: 'V3', to: 'V9' },
    { key: 'E9', from: 'V3', to: 'V10' },
    { key: 'E10', from: 'V3', to: 'V11' },
    // V4 has 4 children
    { key: 'E11', from: 'V4', to: 'V12' },
    { key: 'E12', from: 'V4', to: 'V13' },
    { key: 'E13', from: 'V4', to: 'V14' },
    { key: 'E14', from: 'V4', to: 'V15' },
    // Edges from second orbit to third orbit
    { key: 'E15', from: 'V6', to: 'V16' },
    { key: 'E16', from: 'V7', to: 'V17' },
    { key: 'E17', from: 'V7', to: 'V18' },
    { key: 'E18', from: 'V9', to: 'V19' },
    { key: 'E19', from: 'V10', to: 'V20' },
    { key: 'E20', from: 'V11', to: 'V21' },
    { key: 'E21', from: 'V12', to: 'V22' },
    { key: 'E22', from: 'V13', to: 'V23' },
    { key: 'E23', from: 'V14', to: 'V24' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(ORBITS_GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'quad-increasing'
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

#### **custom**

```tsx
...
import { useWorkletCallback } from 'react-native-reanimated';
import { GetLayerRadiusFunction } from 'react-native-smart-graph';

export default function Graph() {
  ...
  const getLayerRadius: GetLayerRadiusFunction = useWorkletCallback(
    ({ layerIndex }) => {
      return Math.log((layerIndex + 3) ** 3) * 100;
    },
    []
  );
  ...
  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          ...
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'custom',
            getLayerRadius
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
  GetLayerRadiusFunction,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const ORBITS_GRAPH = {
  vertices: [
    { key: 'V0' }, // root
    // First orbit vertices
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    // Second orbit vertices
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' },
    { key: 'V9' },
    { key: 'V10' },
    { key: 'V11' },
    { key: 'V12' },
    { key: 'V13' },
    { key: 'V14' },
    { key: 'V15' },
    // Third orbit vertices
    { key: 'V16' },
    { key: 'V17' },
    { key: 'V18' },
    { key: 'V19' },
    { key: 'V20' },
    { key: 'V21' },
    { key: 'V22' },
    { key: 'V23' },
    { key: 'V24' }
  ],
  edges: [
    // Edges from root to first orbit
    { key: 'E0', from: 'V0', to: 'V1' },
    { key: 'E1', from: 'V0', to: 'V2' },
    { key: 'E2', from: 'V0', to: 'V3' },
    { key: 'E3', from: 'V0', to: 'V4' },
    { key: 'E4', from: 'V0', to: 'V5' },
    // Edges from first orbit to second orbit
    // V1 has 1 child
    { key: 'E5', from: 'V1', to: 'V6' },
    // V2 has 2 children
    { key: 'E6', from: 'V2', to: 'V7' },
    { key: 'E7', from: 'V2', to: 'V8' },
    // V3 has 3 children
    { key: 'E8', from: 'V3', to: 'V9' },
    { key: 'E9', from: 'V3', to: 'V10' },
    { key: 'E10', from: 'V3', to: 'V11' },
    // V4 has 4 children
    { key: 'E11', from: 'V4', to: 'V12' },
    { key: 'E12', from: 'V4', to: 'V13' },
    { key: 'E13', from: 'V4', to: 'V14' },
    { key: 'E14', from: 'V4', to: 'V15' },
    // Edges from second orbit to third orbit
    { key: 'E15', from: 'V6', to: 'V16' },
    { key: 'E16', from: 'V7', to: 'V17' },
    { key: 'E17', from: 'V7', to: 'V18' },
    { key: 'E18', from: 'V9', to: 'V19' },
    { key: 'E19', from: 'V10', to: 'V20' },
    { key: 'E20', from: 'V11', to: 'V21' },
    { key: 'E21', from: 'V12', to: 'V22' },
    { key: 'E22', from: 'V13', to: 'V23' },
    { key: 'E23', from: 'V14', to: 'V24' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(ORBITS_GRAPH), []);

  const getLayerRadius: GetLayerRadiusFunction = useWorkletCallback(
    ({ layerIndex }) => {
      return Math.log((layerIndex + 3) ** 3) * 100;
    },
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'custom',
            getLayerRadius
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

<!-- tabs:end -->

**Result**

<!-- tabs:start -->

#### **auto**

<img src="./assets/images/placement/orbits/example-orbits-auto.png" width="300" alt="auto layer sizing example" />

#### **equal**

<img src="./assets/images/placement/orbits/example-orbits-equal.png" width="300" alt="equal layer sizing example" />

#### **non-decreasing**

<img src="./assets/images/placement/orbits/example-orbits-non-decreasing.png" width="300" alt="non-decreasing layer sizing example" />

#### **quad-increasing**

<img src="./assets/images/placement/orbits/example-orbits-quad-increasing.png" width="300" alt="quad-increasing layer sizing example" />

#### **custom**

<img src="./assets/images/placement/orbits/example-orbits-custom.png" width="300" alt="custom layer sizing example" />

<!-- tabs:end -->

### Root selection

<!-- tabs:start -->

#### **Directed graph**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useCallback, useMemo, useState } from 'react';
import {
  GraphView,
  DirectedGraph,
  VertexPressHandler,
  DirectedGraphComponent,
  DirectedGraphData
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
    { key: 'V8' }
  ],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V4' },
    { key: 'E4', from: 'V2', to: 'V5' },
    { key: 'E5', from: 'V5', to: 'V6' },
    { key: 'E6', from: 'V1', to: 'V7' },
    { key: 'E7', from: 'V5', to: 'V8' }
  ]
};

export default function Graph() {
  const [orbitsRoot, setOrbitsRoot] = useState('');

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const handEVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      setOrbitsRoot(key);
    },
    []
  );

  return (
    <GraphView objectFit='contain'>
      <DirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'auto', // <- doesn't have to be explicitly specified (it's a default option)
            roots: [orbitsRoot]
          },
          // --- End of placement settings ---
          events: {
            onVertexPress: handEVertexPress
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

<!-- accordion:end -->

**Result**

<video src="./assets/videos/placement/orbits/orbits-directed-placement-example.mp4" style="width: 300px"></video>

#### **Undirected graph**

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

const GRAPH: UndirectedGraphData = {
  vertices: [
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' }
  ],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V2', 'V3'] },
    { key: 'E3', vertices: ['V2', 'V4'] },
    { key: 'E4', vertices: ['V2', 'V5'] },
    { key: 'E5', vertices: ['V5', 'V6'] },
    { key: 'E6', vertices: ['V1', 'V7'] },
    { key: 'E7', vertices: ['V5', 'V8'] }
  ]
};

export default function Graph() {
  const [orbitsRoot, setOrbitsRoot] = useState('');

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const handEVertexPress = useCallback<VertexPressHandler>(
    ({ vertex: { key } }) => {
      setOrbitsRoot(key);
    },
    []
  );

  return (
    <GraphView objectFit='contain'>
      <UndirectedGraphComponent
        settings={{
          // --- Placement settings ---
          placement: {
            strategy: 'orbits',
            minVertexSpacing: 50,
            layerSizing: 'auto', // <- doesn't have to be explicitly specified (it's a default option)
            roots: [orbitsRoot]
          },
          // --- End of placement settings ---
          events: {
            onVertexPress: handEVertexPress
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

<!-- accordion:end -->

**Result**

<video src="./assets/videos/placement/orbits/orbits-undirected-placement-example.mp4" style="width: 300px"></video>

<!-- tabs:end -->

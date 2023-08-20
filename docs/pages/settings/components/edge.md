# Edge component settings

## Description

Settings related to **graph edges**. They are used to change the type of edges
(**straight** or **curved**) and **related settings**.

## Usage

```ts
components: {
  ...
  edge: {
    /* Graph edge component settings */
  },
  ...
}
```

## Properties

#### `type`

Type of edge. Determines **how edges will be rendered** when **multiple edges**
are added **between a pair of vertices**.

| Type                       | Default    | Required |
| -------------------------- | ---------- | -------- |
| 'straight' &#124; 'curved' | 'straight' | no       |

#### `maxOffsetFactor` (`straight` edge only)

This property is used to set the **maximum distance** between the **outermost edges** between a pair of vertices. The resulting distance will be calculated
as the **product** of the `maxOffsetFactor` and the vertex `radius`.

| Type     | Default | Required |
| -------- | ------- | -------- |
| 'number' | 0.5     | no       |

## Example

<!-- tabs:start -->

#### **Directed graph**

<!-- tabs:start -->

#### **Straight edges**

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  DirectedGraph,
  DirectedGraphComponent,
  DirectedGraphData,
  GraphView
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V1', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V3' },
    { key: 'E4', from: 'V3', to: 'V1' },
    { key: 'E5', from: 'V3', to: 'V2' },
    { key: 'E6', from: 'V3', to: 'V1' },
    { key: 'E7', from: 'V3', to: 'V2' },
    { key: 'E8', from: 'V3', to: 'V1' },
    { key: 'E9', from: 'V2', to: 'V1' }
  ]
};

export default function Graph() {
  const [maxOffset, setMaxOffset] = useState(0.5);

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const increaseOffset = () =>
    setMaxOffset(prev => Math.min(Math.round(10 * prev + 1) / 10, 1));
  const decreaseOffset = () =>
    setMaxOffset(prev => Math.max(Math.round(10 * prev - 1) / 10, 0.1));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          settings={{
            // --- Graph components settings ---
            components: {
              edge: {
                type: 'straight',
                maxOffsetFactor: maxOffset
              }
            },
            // --- End of graph components settings ---
            placement: {
              strategy: 'circle',
              minVertexDistance: 75
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseOffset} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.radiusText}>{maxOffset}</Text>
          <TouchableOpacity onPress={increaseOffset} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50
  },
  button: {
    backgroundColor: '#edcf46',
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: 5
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  radiusText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    width: 75,
    textAlign: 'center'
  }
});
```

<!-- accordion:end -->

```tsx
...

export default function Graph() {
  ...
  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          settings={{
            ...
            components: {
              edge: {
                type: 'straight',
                maxOffsetFactor: maxOffset
              }
            },
            ...
          }}
          graph={graph}
        />
      </GraphView>
      ...
    </>
  );
}
```

**Result**

<video src="./assets/videos/settings/components/edge/directed-straight-edge-example.mp4" style="width: 300px"></video>

#### **Curved edges**

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo } from 'react';
import {
  DirectedGraphData,
  DirectedGraph,
  GraphView,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V1', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V3' },
    { key: 'E4', from: 'V3', to: 'V1' },
    { key: 'E5', from: 'V3', to: 'V2' },
    { key: 'E6', from: 'V3', to: 'V1' },
    { key: 'E7', from: 'V3', to: 'V2' },
    { key: 'E8', from: 'V3', to: 'V1' },
    { key: 'E9', from: 'V2', to: 'V1' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          // --- Graph components settings ---
          components: {
            edge: {
              type: 'curved'
            }
          },
          // --- End of graph components settings ---
          placement: {
            strategy: 'circle',
            minVertexDistance: 75
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

<!-- accordion:end -->

```tsx
...

export default function Graph() {
  ...
  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          ...
          components: {
            edge: {
              type: 'curved'
            }
          },
          ...
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

**Result**

<img src="./assets/images/settings/components/edge/directed-curved-edges-example.png" width="300" />

<!-- tabs:end -->

#### **Undirected graph**

<!-- tabs:start -->

#### **Straight edges**

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  GraphView,
  UndirectedGraph,
  UndirectedGraphComponent,
  UndirectedGraphData
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V1', 'V3'] },
    { key: 'E3', vertices: ['V2', 'V3'] },
    { key: 'E4', vertices: ['V3', 'V1'] },
    { key: 'E5', vertices: ['V3', 'V2'] },
    { key: 'E6', vertices: ['V3', 'V1'] },
    { key: 'E7', vertices: ['V3', 'V2'] },
    { key: 'E8', vertices: ['V3', 'V1'] },
    { key: 'E9', vertices: ['V2', 'V1'] }
  ]
};

export default function Graph() {
  const [maxOffset, setMaxOffset] = useState(0.5);

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const increaseOffset = () =>
    setMaxOffset(prev => Math.min(Math.round(10 * prev + 1) / 10, 1));
  const decreaseOffset = () =>
    setMaxOffset(prev => Math.max(Math.round(10 * prev - 1) / 10, 0.1));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <UndirectedGraphComponent
          settings={{
            // --- Graph components settings ---
            components: {
              edge: {
                type: 'straight',
                maxOffsetFactor: maxOffset
              }
            },
            // --- End of graph components settings ---
            placement: {
              strategy: 'circle',
              minVertexDistance: 75
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseOffset} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.radiusText}>{maxOffset}</Text>
          <TouchableOpacity onPress={increaseOffset} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50
  },
  button: {
    backgroundColor: '#edcf46',
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: 5
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  radiusText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    width: 75,
    textAlign: 'center'
  }
});
```

<!-- accordion:end -->

```tsx
...

export default function Graph() {
  ...
  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <UndirectedGraphComponent
          settings={{
            ...
            components: {
              edge: {
                type: 'straight',
                maxOffsetFactor: maxOffset
              }
            },
            ...
          }}
          graph={graph}
        />
      </GraphView>
      ...
    </>
  );
}
```

**Result**

<video src="./assets/videos/settings/components/edge/undirected-straight-edge-example.mp4" style="width: 300px"></video>

#### **Curved edges**

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo } from 'react';
import {
  GraphView,
  UndirectedGraph,
  UndirectedGraphComponent,
  UndirectedGraphData
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V1', 'V3'] },
    { key: 'E3', vertices: ['V2', 'V3'] },
    { key: 'E4', vertices: ['V3', 'V1'] },
    { key: 'E5', vertices: ['V3', 'V2'] },
    { key: 'E6', vertices: ['V3', 'V1'] },
    { key: 'E7', vertices: ['V3', 'V2'] },
    { key: 'E8', vertices: ['V3', 'V1'] },
    { key: 'E9', vertices: ['V2', 'V1'] }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  return (
    <GraphView objectFit='contain' padding={50}>
      <UndirectedGraphComponent
        settings={{
          // --- Graph components settings ---
          components: {
            edge: {
              type: 'curved'
            }
          },
          // --- End of graph components settings ---
          placement: {
            strategy: 'circle',
            minVertexDistance: 75
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

<!-- accordion:end -->

```tsx
...

export default function Graph() {
  ...
  return (
    <GraphView objectFit='contain' padding={50}>
      <UndirectedGraphComponent
        settings={{
          ...
          components: {
            edge: {
              type: 'curved'
            }
          },
          ...
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

**Result**

<img src="./assets/images/settings/components/edge/undirected-curved-edges-example.png" width="300" />

<!-- tabs:end -->

<!-- tabs:end -->

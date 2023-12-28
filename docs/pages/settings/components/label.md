# Edge label component settings

## Description

Settings related to **labels** displayed **on graph edges**.

## Usage

```ts
components: {
  ...
  label: {
    /* Graph edge label component settings */
  },
  ...
}
```

> [!NOTE]
> Labels are **<u>not</u> displayed** by defualt. To render labels, you have to pass the **label renderer** in the `renderers` property of the **graph component** as shown in [this](pages/components/graphs?id=renderers) example.

<!-- TODO - fix scroll to section in the above link -->

## Properties

#### `scale`

This property is used to calculate the **label size** relatively to the **vertex radius**.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 0.75    | no       |

> [!NOTE]
> If you use [straight](pages/settings/components/edge?id=type) edges, there might be **not enough space** to **render labels with
> the specified** `scale`. In such case, the label **size** will be **calculated
> automatically** based on the **maximum available space**.
>
> If you use [curved](pages/settings/components/edge?id=type) edges, curves will be calculated
> in such a way that **labels** can be **rendered with the desired size**.

## Example

For **undirected** and **directed** graph label settings work the same and there is no difference
in examples below.

<!-- tabs:start -->

#### **Directed graph**

<!-- tabs:start -->

#### **Straight edges**

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  DirectedGraphData,
  DirectedGraph,
  GraphView,
  DirectedGraphComponent,
  DefaultEdgeLabelRenderer
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V1', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V3' },
    { key: 'E4', from: 'V3', to: 'V1' },
    { key: 'E5', from: 'V3', to: 'V2' },
    { key: 'E6', from: 'V3', to: 'V1' }
  ]
};

export default function Graph() {
  const [scale, setScale] = useState(1);

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const increaseScale = () =>
    setScale(prev => Math.min(Math.round(10 * prev + 2) / 10, 2));
  const decreaseScale = () =>
    setScale(prev => Math.max(Math.round(10 * prev - 2) / 10, 0.2));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            // --- Graph components settings ---
            components: {
              label: {
                scale
              }
            },
            // --- End of graph components settings ---
            placement: {
              strategy: 'circle',
              minVertexDistance: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseScale} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.radiusText}>{scale}</Text>
          <TouchableOpacity onPress={increaseScale} style={styles.button}>
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
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            ...
            components: {
              label: {
                scale
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

<video src="./assets/videos/settings/components/label/directed-label-size-ratio-example.mp4" style="width: 300px"></video>

#### **Curved edges**

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  DefaultEdgeLabelRenderer,
  DirectedGraphComponent,
  DirectedGraphData,
  DirectedGraph
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V1', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V3' },
    { key: 'E4', from: 'V3', to: 'V1' },
    { key: 'E5', from: 'V3', to: 'V2' },
    { key: 'E6', from: 'V3', to: 'V1' }
  ]
};

export default function Graph() {
  const [scale, setScale] = useState(1);

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const increaseScale = () =>
    setScale(prev => Math.min(Math.round(10 * prev + 2) / 10, 2));
  const decreaseScale = () =>
    setScale(prev => Math.max(Math.round(10 * prev - 2) / 10, 0.2));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            // --- Graph components settings ---
            components: {
              label: {
                scale
              },
              edge: {
                type: 'curved'
              }
            },
            // --- End of graph components settings ---
            placement: {
              strategy: 'circle',
              minVertexDistance: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseScale} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.radiusText}>{scale}</Text>
          <TouchableOpacity onPress={increaseScale} style={styles.button}>
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
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            ...
            components: {
              label: {
                scale
              },
              edge: {
                type: 'curved'
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

<video src="./assets/videos/settings/components/label/directed-curved-edges-label-size-example.mp4" style="width: 300px"></video>

<!-- tabs:end -->

#### **Undirected graph**

<!-- tabs:start -->

#### **Straight edges**

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  DefaultEdgeLabelRenderer,
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
    { key: 'E6', vertices: ['V3', 'V1'] }
  ]
};

export default function Graph() {
  const [scale, setScale] = useState(1);

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const increaseScale = () =>
    setScale(prev => Math.min(Math.round(10 * prev + 2) / 10, 2));
  const decreaseScale = () =>
    setScale(prev => Math.max(Math.round(10 * prev - 2) / 10, 0.2));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <UndirectedGraphComponent
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            // --- Graph components settings ---
            components: {
              label: {
                scale
              }
            },
            // --- End of graph components settings ---
            placement: {
              strategy: 'circle',
              minVertexDistance: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseScale} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.radiusText}>{scale}</Text>
          <TouchableOpacity onPress={increaseScale} style={styles.button}>
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
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            ...
            components: {
              label: {
                scale
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

<video src="./assets/videos/settings/components/label/undirected-label-size-ratio-example.mp4" style="width: 300px"></video>

#### **Curved edges**

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  DefaultEdgeLabelRenderer,
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
    { key: 'E6', vertices: ['V3', 'V1'] }
  ]
};

export default function Graph() {
  const [scale, setScale] = useState(1);

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const increaseScale = () =>
    setScale(prev => Math.min(Math.round(10 * prev + 2) / 10, 2));
  const decreaseScale = () =>
    setScale(prev => Math.max(Math.round(10 * prev - 2) / 10, 0.2));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <UndirectedGraphComponent
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            // --- Graph components settings ---
            components: {
              label: {
                scale
              },
              edge: {
                type: 'curved'
              }
            },
            // --- End of graph components settings ---
            placement: {
              strategy: 'circle',
              minVertexDistance: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseScale} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.radiusText}>{scale}</Text>
          <TouchableOpacity onPress={increaseScale} style={styles.button}>
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
          renderers={{
            label: DefaultEdgeLabelRenderer
          }}
          settings={{
            ...
            components: {
              label: {
                scale
              },
              edge: {
                type: 'curved'
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

<video src="./assets/videos/settings/components/label/undirected-curved-edges-label-size-example.mp4" style="width: 300px"></video>

<!-- tabs:end -->

<!-- tabs:end -->

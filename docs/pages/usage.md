# Basic usage

## GestureHandlerRootView

The graph component must be wrapped with the `GestureHandlerRootView` component from the `react-native-gesture-handler` library. This enables the appropriate handling of touch gestures.

**Example code**

```tsx
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Place your graph component in here */}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  }
});
```

> [!TIP]
> Remember to specify the size of the `GestureHandlerRootView` (usually `flex: 1` to occupy the whole available space) as it's default height is 0.

## Graph component

Here is a simple usage example of the library without any additional settings of `GraphView` and `DirectedGraphComponent`/`UndirectedGraphComponent` components.

<!-- tabs:start -->

#### **Directed graph**

**Example code**

```tsx
import { useMemo } from 'react';
import {
  GraphView,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { from: 'V1', key: 'E1', to: 'V2' },
    { from: 'V2', key: 'E2', to: 'V3' },
    { from: 'V3', key: 'E3', to: 'V1' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  return (
    <GraphView>
      <DirectedGraphComponent graph={graph} />
    </GraphView>
  );
}
```

**Expected result**

<img src="./assets/images/usage/directed-graph.png" width="300" />

#### **Undirected Graph**

**Example code**

```tsx
import { useMemo } from 'react';
import {
  GraphView,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V2', 'V3'] },
    { key: 'E3', vertices: ['V3', 'V1'] }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  return (
    <GraphView>
      <UndirectedGraphComponent graph={graph} />
    </GraphView>
  );
}
```

**Expected result**

<img src="./assets/images/usage/undirected-graph.png" width="300" />

<!-- tabs:end -->

> [!NOTE]
> The rendered graph probably will look slightly different on your device because vertices are placed using the `random` placement strategy by default.

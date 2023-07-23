# Graph components

## Description

There are 2 graph components exported by the library:

- `DirectedGraphComponent`
- `UndirectedGraphComponent`

In essence, both components **work the same** underneath the hood. The main motivation behind creating 2 separate components was to provide **accurate TypeScript types** for different graph [models](pages/models/index.md), graph [settings](pages/components/graphs?id=settings) and [renderers](pages/components/graphs?id=renderers).

## Features

- **rendering** graph on the canvas,
- managing multiple graph features through the `settings` object, such as:

  - changing graph [components settings](pages/graph-components-settings.md),
  - setting the [placement strategy](pages/placement/index.md) which modifies the vertices placement positions on the canvas,
  - modifying the [layout type](pages/layout/index.md) that changes the vertices behavior (the graph can be either **static**, or **dynamically change** vertices placement based on their **relative distance** or **connections**),
  - managing [graph events](pages/events.md) (for now only vertex press events)

- using custom [component renderers](pages/renderers/index.md) to customize the appearance of the graph,

<!-- TODO - add information about multi step focus when implemented -->

## Usage

<!-- tabs:start -->

#### **Directed graph**

```tsx
import { useMemo } from 'react';
import {
  DirectedGraphData,
  DirectedGraph,
  GraphView,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  ...
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  return (
    <GraphView>
      {/* Graph component */}
      <DirectedGraphComponent
        graph={graph}
        ...
      />
      {/* End of graph component */}
    </GraphView>
  );
}
```

#### **Undirected graph**

```tsx
import { useMemo } from 'react';
import {
  GraphView,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  ...
};

export default function Graph() {
  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  return (
    <GraphView>
      {/* Graph component */}
      <UndirectedGraphComponent
        graph={graph}
        ...
      />
      {/* End of graph component */}
    </GraphView>
  );
}
```

<!-- tabs:end -->

## Properties

In all **generic types**, the `V` type is a type of the **vertex data** and the `E` type is a type of the **edge data**.

For example, if **vertices** in your graph will have data of type `VertexData` and **edges** will have data of type `EdgeData`, you should **replace** `V` with `VertexData` and `E` with `EdgeData` when using the type.

<!-- TODO - add link to models docs where data types are described after docs page is created -->

If edge or edge has **no data**, leave these types **empty**.

#### `graph`

The only required property that should be passed the **graph model** representing the **graph structure to render**.

For more information about graph models, visit [this](pages/models/index.md) page of documentation.

<!-- tabs:start -->

#### **Directed graph**

| Type                | Default | Required |
| ------------------- | ------- | -------- |
| DirectedGraph<V, E> | -       | yes      |

You should create a graph object and pass this object in the `graph` property as shown in the example below.

**Example**

```tsx
import { useMemo } from 'react';
import { DirectedGraph, DirectedGraphData } from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  ...
};

const graph = useMemo(() => new DirectedGraph(GRAPH), []);
```

> [!ATTENTION]
> The `graph` object should be memoized with the `useMemo` hook to prevent re-renders of the `DirectedGraphComponent` on every parent component re-render. You should pass the new `graph` object only if you want to render the new graph without modifying the one used before.

#### **Undirected graph**

| Type                  | Default | Required |
| --------------------- | ------- | -------- |
| UndirectedGraph<V, E> | -       | yes      |

You should create a graph object and pass this object in the `graph` property as shown in the example below.

**Example**

```tsx
import { useMemo } from 'react';
import { UndirectedGraph, UndirectedGraphData } from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  ...
};

const graph = useMemo(() => new UndirectedGraph(GRAPH), []);
```

> [!ATTENTION]
> The `graph` object should be memoized with the `useMemo` hook to prevent re-renders of the `UndirectedGraphComponent` on every parent component re-render. You should pass the new `graph` object only if you want to render the new graph without modifying the one used before.

<!-- tabs:end -->

#### `settings`

This property takes an object with **all graph-related settings**.

<!-- tabs:start -->

#### **Directed graph**

| Type                        | Default | Required |
| --------------------------- | ------- | -------- |
| DirectedGraphSettings<V, E> | -       | no       |

> [!NOTE]
> The `settings` object can be passed directly to the `DirectedGraphComponent` without being memoized. The library used its own memoization logic based on deep comparisons of properties passed to the graph component. Only callback functions (if present) should be memoized.

```ts
type DirectedGraphSettings<V> = {
  components?: DirectedGraphComponentsSettings;
  placement?: GraphPlacementSettings;
  layout?: GraphLayoutSettings;
  events?: GraphEventsSettings<V>;
  animations?: GraphAnimationsSettings;
};
```

All properties of the `settings` object are described in detail in separate pages of the documentation:

- [components](pages/graph-components-settings.md),
- [placement](pages/placement/index.md),
- [layout](pages/layout/index.md),
- [events](pages/events.md),
- [animations](pages/animations/index.md)

#### **Undirected graph**

| Type                          | Default | Required |
| ----------------------------- | ------- | -------- |
| UndirectedGraphSettings<V, E> | -       | no       |

> [!NOTE]
> The `settings` object can be passed directly to the `UndirectedGraphComponent` without being memoized. The library used its own memoization logic based on deep comparisons of properties passed to the graph component. Only callback functions (if present) should be memoized.

```ts
type UndirectedGraphSettings<V> = {
  components?: UndirectedGraphComponentsSettings;
  placement?: GraphPlacementSettings;
  layout?: GraphLayoutSettings;
  events?: GraphEventsSettings<V>;
  animations?: GraphAnimationsSettings;
};
```

All properties of the `settings` object are described in detail in separate pages of the documentation:

- [components](pages/graph-components-settings.md),
- [placement](pages/placement/index.md),
- [layout](pages/layout/index.md),
- [events](pages/events.md),
- [animations](pages/animations/index.md)

<!-- tabs:end -->

#### `renderers`

The object with custom renderers of graph components. Renderers are, in essence, **custom components** used to **render parts of the graph** on hte canvas.

For more details refer to [this](pages/renderers/index.md) page.

<!-- tabs:start -->

#### **Directed graph**

| Type                         | Default | Required |
| ---------------------------- | ------- | -------- |
| DirectedGraphRenderers<V, E> | -       | no       |

The only renderer that has **no implementation** assigned by default is the `label` renderer.

To render labels over edges with the **edge key** as the **label text**, you can use the `DefaultEdgeLabelRenderer` renderer provided by the library. If you want to implement your custom edge label renderer, refer to [this](pages/renderers/index.md) section of the [component renderers](pages/renderers/index.md) documentation page.

<!-- TODO - update this link once renderers documentation page is ready  -->

```ts
type DirectedGraphRenderers<V, E> = {
  edge?: EdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
  vertex?: VertexRenderFunction<V>;
  arrow?: EdgeArrowRenderFunction;
};
```

<!-- accordion:start -->

#### _Example_

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  DefaultEdgeLabelRenderer,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V3', to: 'V1' },
    { key: 'E4', from: 'V1', to: 'V3' },
    { key: 'E5', from: 'V3', to: 'V2' },
    { key: 'E6', from: 'V1', to: 'V3' }
  ]
};

export default function Graph() {
  const [showLabels, setShowLabels] = useState(true);

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const toggleLabels = () => setShowLabels(!showLabels);

  return (
    <>
      <GraphView objectFit='contain' padding={25}>
        <DirectedGraphComponent
          renderers={{
            label: showLabels ? DefaultEdgeLabelRenderer : undefined
          }}
          settings={{
            placement: {
              strategy: 'circle',
              minVertexSpacing: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <TouchableOpacity onPress={toggleLabels} style={styles.button}>
          <Text style={styles.buttonText}>
            {showLabels ? 'Hide' : 'Show'} labels
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#edcf46',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 50,
    paddingHorizontal: 25,
    paddingVertical: 10
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
```

<!-- accordion:end -->

**Result**

<img src="./assets/images/components/graphs/example-labels-directed.gif" alt="directed graph labels example" width="300" />

<!-- accordion:end -->

#### **Undirected graph**

| Type                           | Default | Required |
| ------------------------------ | ------- | -------- |
| UndirectedGraphRenderers<V, E> | -       | no       |

The only renderer that has **no implementation** assigned by default is the `label` renderer.

To render labels over edges with the **edge key** as the **label text**, you can use the `DefaultEdgeLabelRenderer` renderer provided by the library. If you want to implement your custom edge label renderer, refer to [this](pages/renderers/index.md) section of the [component renderers](pages/renderers/index.md) documentation page.

<!-- TODO - update this link once renderers documentation page is ready  -->

```ts
type UndirectedGraphRenderers<V, E> = {
  edge?: EdgeRenderFunction<E>;
  label?: EdgeLabelRendererFunction<E>;
  vertex?: VertexRenderFunction<V>;
};
```

<!-- accordion:start -->

#### _Example_

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent,
  DefaultEdgeLabelRenderer
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V2', 'V3'] },
    { key: 'E3', vertices: ['V3', 'V1'] },
    { key: 'E4', vertices: ['V1', 'V3'] },
    { key: 'E5', vertices: ['V3', 'V2'] },
    { key: 'E6', vertices: ['V1', 'V3'] }
  ]
};

export default function Graph() {
  const [showLabels, setShowLabels] = useState(true);

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const toggleLabels = () => setShowLabels(!showLabels);

  return (
    <>
      <GraphView objectFit='contain' padding={25}>
        <UndirectedGraphComponent
          renderers={{
            label: showLabels ? DefaultEdgeLabelRenderer : undefined
          }}
          settings={{
            placement: {
              strategy: 'circle',
              minVertexSpacing: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <TouchableOpacity onPress={toggleLabels} style={styles.button}>
          <Text style={styles.buttonText}>
            {showLabels ? 'Hide' : 'Show'} labels
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#edcf46',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 50,
    paddingHorizontal: 25,
    paddingVertical: 10
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
```

<!-- accordion:end -->

**Result**

<img src="./assets/images/components/graphs/example-labels-undirected.gif" alt="undirected graph labels example" width="300" />

<!-- accordion:end -->

<!-- tabs:end -->

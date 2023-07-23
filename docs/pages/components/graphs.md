# Graphs

## Description

There are 2 graph components exported by the library:

- `DirectedGraphComponent`
- `UndirectedGraphComponent`

In essence, both components **work the same** underneath the hood. The main motivation behind creating 2 separate components was to provide **accurate TypeScript types** for different graph [models](pages/models.md).

## Features

- **rendering** graph on the canvas,
- managing multiple graph features through the `settings` object, such as:

  - using custom [component renderers](pages/renderers.md) to customize the appearance of the graph,
  - setting the [placement strategy](pages/placement/index.md) which modifies the vertices placement positions on the canvas,
  - modifying the [layout type](pages/layout.md) that changes the vertices behavior (the graph can be either **static**, or **dynamically change** vertices placement based on their **relative distance** or **connections**),
  - managing [graph events](pages/events.md) (for now only vertex press events)

  <!-- TODO - add information about multi step focus when implemented -->

## Usage

The library provides types for easier declaration of data passed to the graph model as shown in the example below. For more information about graph models, visit [this](pages/models.md) page of documentation.

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
      <DirectedGraphComponent
        graph={graph}
        ...
      />
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
      <UndirectedGraphComponent
        graph={graph}
        ...
      />
    </GraphView>
  );
}
```

<!-- tabs:end -->

## Properties

## Example

# Graph components

## Description

There are 2 graph components exported by the library:

- `DirectedGraphComponent`
- `UndirectedGraphComponent`

In essence, both components **work the same** underneath the hood. The main motivation behind creating 2 separate components was to provide **accurate TypeScript types** for different graph [models](pages/models/index.md).

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

<details>
<summary>Example</summary>
<article>

  <details>
  <summary>Show full code</summary>
  <article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> StyleSheet<span class="token punctuation">,</span> Text<span class="token punctuation">,</span> View <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> TouchableOpacity <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-gesture-handler'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  DefaultEdgeLabelRenderer<span class="token punctuation">,</span>
  DirectedGraphData<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">GRAPH</span><span class="token operator">:</span> DirectedGraphData <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>showLabels<span class="token punctuation">,</span> setShowLabels<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">toggleLabels</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">setShowLabels</span><span class="token punctuation">(</span><span class="token operator">!</span>showLabels<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">25</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
          <span class="token attr-name">renderers</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
            <span class="token literal-property property">label</span><span class="token operator">:</span> showLabels <span class="token operator">?</span> DefaultEdgeLabelRenderer <span class="token operator">:</span> <span class="token keyword">undefined</span>
          <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
          <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
            <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
              <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'circle'</span><span class="token punctuation">,</span>
              <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">100</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
          <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
        <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token punctuation">{</span><span class="token comment">/* Helper overlay to change dimensions */</span><span class="token punctuation">}</span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">View</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>overlay<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">TouchableOpacity</span></span> <span class="token attr-name">onPress</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>toggleLabels<span class="token punctuation">}</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>button<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>buttonText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
            </span><span class="token punctuation">{</span>showLabels <span class="token operator">?</span> <span class="token string">'Hide'</span> <span class="token operator">:</span> <span class="token string">'Show'</span><span class="token punctuation">}</span><span class="token plain-text"> labels
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">TouchableOpacity</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">View</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> styles <span class="token operator">=</span> StyleSheet<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token literal-property property">overlay</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span>StyleSheet<span class="token punctuation">.</span>absoluteFillObject<span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'flex-end'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">pointerEvents</span><span class="token operator">:</span> <span class="token string">'box-none'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">alignItems</span><span class="token operator">:</span> <span class="token string">'center'</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">button</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">backgroundColor</span><span class="token operator">:</span> <span class="token string">'#edcf46'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'center'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">borderRadius</span><span class="token operator">:</span> <span class="token number">5</span><span class="token punctuation">,</span>
    <span class="token literal-property property">marginBottom</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
    <span class="token literal-property property">paddingHorizontal</span><span class="token operator">:</span> <span class="token number">25</span><span class="token punctuation">,</span>
    <span class="token literal-property property">paddingVertical</span><span class="token operator">:</span> <span class="token number">10</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">buttonText</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">fontSize</span><span class="token operator">:</span> <span class="token number">30</span><span class="token punctuation">,</span>
    <span class="token literal-property property">lineHeight</span><span class="token operator">:</span> <span class="token number">30</span><span class="token punctuation">,</span>
    <span class="token literal-property property">fontWeight</span><span class="token operator">:</span> <span class="token string">'bold'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">textAlign</span><span class="token operator">:</span> <span class="token string">'center'</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

  </article>
  </details>

<string>Result</string>

<img src="./assets/images/components/graphs/example-labels-directed.gif" alt="directed graph labels example" width="300" />

</article>
</details>

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

<details>
<summary>Example</summary>
<article>

  <details>
  <summary>Show full code</summary>
  <article>

  <pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> StyleSheet<span class="token punctuation">,</span> Text<span class="token punctuation">,</span> View <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> TouchableOpacity <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-gesture-handler'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  UndirectedGraphData<span class="token punctuation">,</span>
  UndirectedGraph<span class="token punctuation">,</span>
  UndirectedGraphComponent<span class="token punctuation">,</span>
  DefaultEdgeLabelRenderer
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">GRAPH</span><span class="token operator">:</span> UndirectedGraphData <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token string">'V2'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token string">'V3'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token string">'V1'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token string">'V3'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token string">'V2'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token string">'V3'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>showLabels<span class="token punctuation">,</span> setShowLabels<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">UndirectedGraph</span><span class="token punctuation">(</span><span class="token constant">GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">toggleLabels</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">setShowLabels</span><span class="token punctuation">(</span><span class="token operator">!</span>showLabels<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">25</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">UndirectedGraphComponent</span></span>
          <span class="token attr-name">renderers</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
            <span class="token literal-property property">label</span><span class="token operator">:</span> showLabels <span class="token operator">?</span> DefaultEdgeLabelRenderer <span class="token operator">:</span> <span class="token keyword">undefined</span>
          <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
          <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
            <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
              <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'circle'</span><span class="token punctuation">,</span>
              <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">100</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
          <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
        <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token punctuation">{</span><span class="token comment">/* Helper overlay to change dimensions */</span><span class="token punctuation">}</span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">View</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>overlay<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">TouchableOpacity</span></span> <span class="token attr-name">onPress</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>toggleLabels<span class="token punctuation">}</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>button<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>buttonText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
            </span><span class="token punctuation">{</span>showLabels <span class="token operator">?</span> <span class="token string">'Hide'</span> <span class="token operator">:</span> <span class="token string">'Show'</span><span class="token punctuation">}</span><span class="token plain-text"> labels
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">TouchableOpacity</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">View</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> styles <span class="token operator">=</span> StyleSheet<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token literal-property property">overlay</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span>StyleSheet<span class="token punctuation">.</span>absoluteFillObject<span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'flex-end'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">pointerEvents</span><span class="token operator">:</span> <span class="token string">'box-none'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">alignItems</span><span class="token operator">:</span> <span class="token string">'center'</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">button</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">backgroundColor</span><span class="token operator">:</span> <span class="token string">'#edcf46'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'center'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">borderRadius</span><span class="token operator">:</span> <span class="token number">5</span><span class="token punctuation">,</span>
    <span class="token literal-property property">marginBottom</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
    <span class="token literal-property property">paddingHorizontal</span><span class="token operator">:</span> <span class="token number">25</span><span class="token punctuation">,</span>
    <span class="token literal-property property">paddingVertical</span><span class="token operator">:</span> <span class="token number">10</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">buttonText</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">fontSize</span><span class="token operator">:</span> <span class="token number">30</span><span class="token punctuation">,</span>
    <span class="token literal-property property">lineHeight</span><span class="token operator">:</span> <span class="token number">30</span><span class="token punctuation">,</span>
    <span class="token literal-property property">fontWeight</span><span class="token operator">:</span> <span class="token string">'bold'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">textAlign</span><span class="token operator">:</span> <span class="token string">'center'</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

  </article>
  </details>

<string>Result</string>

<img src="./assets/images/components/graphs/example-labels-undirected.gif" alt="undirected graph labels example" width="300" />

</article>
</details>

<!-- tabs:end -->

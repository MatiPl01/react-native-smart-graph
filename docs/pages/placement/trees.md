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

<!-- tabs:start -->

**Code snippets**

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

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useCallback<span class="token punctuation">,</span> useMemo<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent<span class="token punctuation">,</span>
  DirectedGraphData<span class="token punctuation">,</span>
  VertexPressHandler
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">LARGE_TREE</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV8'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'LV1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'LV2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'LV2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'LV3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'LV2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'LV4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'LV2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'LV5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'LV5'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'LV6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'LV1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'LV7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'LV5'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'LV8'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">SMALL_TREE</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SV1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SV2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SV3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SV4'</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SE1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'SV1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'SV2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SE2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'SV1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'SV3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SE3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'SV1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'SV4'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">COMBINED_GRAPH</span><span class="token operator">:</span> DirectedGraphData <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token operator">...</span><span class="token constant">SMALL_TREE</span><span class="token punctuation">.</span>vertices<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token constant">LARGE_TREE</span><span class="token punctuation">.</span>vertices<span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token operator">...</span><span class="token constant">SMALL_TREE</span><span class="token punctuation">.</span>edges<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token constant">LARGE_TREE</span><span class="token punctuation">.</span>edges<span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>smallTreeRoot<span class="token punctuation">,</span> setSmallTreeRoot<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">''</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>largeTreeRoot<span class="token punctuation">,</span> setLargeTreeRoot<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">''</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">COMBINED_GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> handleVertexPress <span class="token operator">=</span> useCallback<span class="token operator">&lt;</span>VertexPressHandler<span class="token operator">&gt;</span><span class="token punctuation">(</span>
    <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> <span class="token literal-property property">vertex</span><span class="token operator">:</span> <span class="token punctuation">{</span> key <span class="token punctuation">}</span> <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>key<span class="token punctuation">.</span><span class="token function">startsWith</span><span class="token punctuation">(</span><span class="token string">'SV'</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">setSmallTreeRoot</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function">setLargeTreeRoot</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">[</span><span class="token punctuation">]</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
        <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          <span class="token comment">// --- Placement settings ---</span>
          <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'trees'</span><span class="token punctuation">,</span>
            <span class="token literal-property property">roots</span><span class="token operator">:</span> <span class="token punctuation">[</span>smallTreeRoot<span class="token punctuation">,</span> largeTreeRoot<span class="token punctuation">]</span><span class="token punctuation">,</span>
            <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">50</span>
          <span class="token punctuation">}</span><span class="token punctuation">,</span>
          <span class="token comment">// --- End of placement settings ---</span>
          <span class="token literal-property property">events</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">onVertexPress</span><span class="token operator">:</span> handleVertexPress
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
        <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

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

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useCallback<span class="token punctuation">,</span> useMemo<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  VertexPressHandler<span class="token punctuation">,</span>
  UndirectedGraphData<span class="token punctuation">,</span>
  UndirectedGraph<span class="token punctuation">,</span>
  UndirectedGraphComponent
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">LARGE_TREE</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LV8'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE1'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'LV1'</span><span class="token punctuation">,</span> <span class="token string">'LV2'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE2'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'LV2'</span><span class="token punctuation">,</span> <span class="token string">'LV3'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE3'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'LV2'</span><span class="token punctuation">,</span> <span class="token string">'LV4'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE4'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'LV2'</span><span class="token punctuation">,</span> <span class="token string">'LV5'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE5'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'LV5'</span><span class="token punctuation">,</span> <span class="token string">'LV6'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE6'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'LV1'</span><span class="token punctuation">,</span> <span class="token string">'LV7'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'LE7'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'LV5'</span><span class="token punctuation">,</span> <span class="token string">'LV8'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">SMALL_TREE</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SV1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SV2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SV3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SV4'</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SE1'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'SV1'</span><span class="token punctuation">,</span> <span class="token string">'SV2'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SE2'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'SV1'</span><span class="token punctuation">,</span> <span class="token string">'SV3'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'SE3'</span><span class="token punctuation">,</span> <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'SV1'</span><span class="token punctuation">,</span> <span class="token string">'SV4'</span><span class="token punctuation">]</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">COMBINED_GRAPH</span><span class="token operator">:</span> UndirectedGraphData <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token operator">...</span><span class="token constant">SMALL_TREE</span><span class="token punctuation">.</span>vertices<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token constant">LARGE_TREE</span><span class="token punctuation">.</span>vertices<span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token operator">...</span><span class="token constant">SMALL_TREE</span><span class="token punctuation">.</span>edges<span class="token punctuation">,</span> <span class="token operator">...</span><span class="token constant">LARGE_TREE</span><span class="token punctuation">.</span>edges<span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>smallTreeRoot<span class="token punctuation">,</span> setSmallTreeRoot<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">''</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>largeTreeRoot<span class="token punctuation">,</span> setLargeTreeRoot<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">''</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">UndirectedGraph</span><span class="token punctuation">(</span><span class="token constant">COMBINED_GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> handleVertexPress <span class="token operator">=</span> useCallback<span class="token operator">&lt;</span>VertexPressHandler<span class="token operator">&gt;</span><span class="token punctuation">(</span>
    <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> <span class="token literal-property property">vertex</span><span class="token operator">:</span> <span class="token punctuation">{</span> key <span class="token punctuation">}</span> <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>key<span class="token punctuation">.</span><span class="token function">startsWith</span><span class="token punctuation">(</span><span class="token string">'SV'</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">setSmallTreeRoot</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function">setLargeTreeRoot</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">[</span><span class="token punctuation">]</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">UndirectedGraphComponent</span></span>
        <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          <span class="token comment">// --- Placement settings ---</span>
          <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'trees'</span><span class="token punctuation">,</span>
            <span class="token literal-property property">roots</span><span class="token operator">:</span> <span class="token punctuation">[</span>smallTreeRoot<span class="token punctuation">,</span> largeTreeRoot<span class="token punctuation">]</span><span class="token punctuation">,</span>
            <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">50</span>
          <span class="token punctuation">}</span><span class="token punctuation">,</span>
          <span class="token comment">// --- End of placement settings ---</span>
          <span class="token literal-property property">events</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">onVertexPress</span><span class="token operator">:</span> handleVertexPress
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
        <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

<!-- tabs:end -->

**Result**

<!-- tabs:start -->

#### **Directed Graph**

<video src="./assets/videos/placement/trees/trees-directed-placement-example.mp4" style="width: 300px"></video>

#### **Undirected Graph**

<video src="./assets/videos/placement/trees/trees-undirected-placement-example.mp4" style="width: 300px"></video>

<!-- tabs:end -->

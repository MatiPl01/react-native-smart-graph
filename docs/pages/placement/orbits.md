# Orbits placement strategy

## Description

Orbits placement strategy works similarly to the [trees](pages/placement/trees.md) placement strategy. It looks for the root vertex, and distributes other vertices relatively to the selected root.

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
        Areas with different background colors represent different sectors. Each vertex connected to the root will have its <b>own sector</b>. The <b>size of the sector</b> depends on <b>how sparse the subtree</b> is.
      </p>
      <p>
        Sectors are further divided into smaller sectors. For example, the <b>V02</b> vertex is the root of its subtree and its sector is divided into 2 sectors, one for the <b>V07</b> vertex, and the other for the <b>V08</b> vertex.
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
> The `'custom'` layer sizing requires the [getLayerRadius](pages/placement/orbits?id=getlayerradius) property described below.

#### `getLayerRadius`

A worklet function that is used for layer radiuses calculation.

| Type                                                                                        | Default | Required |
| ------------------------------------------------------------------------------------------- | ------- | -------- |
| props: { layerIndex: number; layersCount: number; previousLayerRadius: number; }) => number | -       | yes\*    |

\*Required only for the `'custom'` layer sizing.

## Root vertices

> The logic is **the same** as for the [trees](pages/placement/trees?id=root-vertices) placement strategy.

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

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">ORBITS_GRAPH</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V0'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">// root</span>
    <span class="token comment">// First orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Second orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Third orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token comment">// Edges from root to first orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E0'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from first orbit to second orbit</span>
    <span class="token comment">// V1 has 1 child</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V2 has 2 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V3 has 3 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E8'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E9'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E10'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V4 has 4 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E11'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E12'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E13'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E14'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from second orbit to third orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E15'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V6'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E16'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E17'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E18'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V9'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E19'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V10'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E20'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V11'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E21'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V12'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E22'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V13'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E23'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V14'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">ORBITS_GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
        <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          <span class="token comment">// --- Placement settings ---</span>
          <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'orbits'</span><span class="token punctuation">,</span>
            <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
            <span class="token literal-property property">layerSizing</span><span class="token operator">:</span> <span class="token string">'auto'</span> <span class="token comment">// &lt;- doesn't have to be explicitly specified (it's a default option)</span>
          <span class="token punctuation">}</span>
          <span class="token comment">// --- End of placement settings ---</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
        <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

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

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">ORBITS_GRAPH</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V0'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">// root</span>
    <span class="token comment">// First orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Second orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Third orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token comment">// Edges from root to first orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E0'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from first orbit to second orbit</span>
    <span class="token comment">// V1 has 1 child</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V2 has 2 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V3 has 3 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E8'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E9'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E10'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V4 has 4 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E11'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E12'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E13'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E14'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from second orbit to third orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E15'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V6'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E16'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E17'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E18'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V9'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E19'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V10'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E20'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V11'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E21'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V12'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E22'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V13'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E23'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V14'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">ORBITS_GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
        <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          <span class="token comment">// --- Placement settings ---</span>
          <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'orbits'</span><span class="token punctuation">,</span>
            <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
            <span class="token literal-property property">layerSizing</span><span class="token operator">:</span> <span class="token string">'equal'</span>
          <span class="token punctuation">}</span>
          <span class="token comment">// --- End of placement settings ---</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
        <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

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

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">ORBITS_GRAPH</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V0'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">// root</span>
    <span class="token comment">// First orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Second orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Third orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token comment">// Edges from root to first orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E0'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from first orbit to second orbit</span>
    <span class="token comment">// V1 has 1 child</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V2 has 2 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V3 has 3 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E8'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E9'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E10'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V4 has 4 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E11'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E12'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E13'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E14'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from second orbit to third orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E15'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V6'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E16'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E17'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E18'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V9'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E19'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V10'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E20'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V11'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E21'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V12'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E22'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V13'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E23'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V14'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">ORBITS_GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
        <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          <span class="token comment">// --- Placement settings ---</span>
          <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'orbits'</span><span class="token punctuation">,</span>
            <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
            <span class="token literal-property property">layerSizing</span><span class="token operator">:</span> <span class="token string">'non-decreasing'</span>
          <span class="token punctuation">}</span>
          <span class="token comment">// --- End of placement settings ---</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
        <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

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

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">ORBITS_GRAPH</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V0'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">// root</span>
    <span class="token comment">// First orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Second orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Third orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token comment">// Edges from root to first orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E0'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from first orbit to second orbit</span>
    <span class="token comment">// V1 has 1 child</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V2 has 2 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V3 has 3 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E8'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E9'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E10'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V4 has 4 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E11'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E12'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E13'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E14'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from second orbit to third orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E15'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V6'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E16'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E17'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E18'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V9'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E19'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V10'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E20'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V11'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E21'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V12'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E22'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V13'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E23'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V14'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">ORBITS_GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
        <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          <span class="token comment">// --- Placement settings ---</span>
          <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'orbits'</span><span class="token punctuation">,</span>
            <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
            <span class="token literal-property property">layerSizing</span><span class="token operator">:</span> <span class="token string">'quad-increasing'</span>
          <span class="token punctuation">}</span>
          <span class="token comment">// --- End of placement settings ---</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
        <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
      <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

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

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> useWorkletCallback <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-reanimated'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  GetLayerRadiusFunction<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">ORBITS_GRAPH</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V0'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">// root</span>
    <span class="token comment">// First orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Second orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Third orbit vertices</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token comment">// Edges from root to first orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E0'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V0'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from first orbit to second orbit</span>
    <span class="token comment">// V1 has 1 child</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V2 has 2 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V3 has 3 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E8'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E9'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V10'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E10'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V11'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// V4 has 4 children</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E11'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V12'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E12'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V13'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E13'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V14'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E14'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V4'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V15'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// Edges from second orbit to third orbit</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E15'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V6'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V16'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E16'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V17'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E17'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V7'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V18'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E18'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V9'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V19'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E19'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V10'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V20'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E20'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V11'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V21'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E21'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V12'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V22'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E22'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V13'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V23'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E23'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V14'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V24'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">ORBITS_GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token literal-property property">getLayerRadius</span><span class="token operator">:</span> GetLayerRadiusFunction <span class="token operator">=</span> <span class="token function">useWorkletCallback</span><span class="token punctuation">(</span>
    <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> layerIndex <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> Math<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token punctuation">(</span>layerIndex <span class="token operator">+</span> <span class="token number">3</span><span class="token punctuation">)</span> <span class="token operator">**</span> <span class="token number">3</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">100</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">[</span><span class="token punctuation">]</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
        <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          <span class="token comment">// --- Placement settings ---</span>
          <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'orbits'</span><span class="token punctuation">,</span>
            <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
            <span class="token literal-property property">layerSizing</span><span class="token operator">:</span> <span class="token string">'custom'</span><span class="token punctuation">,</span>
            getLayerRadius
          <span class="token punctuation">}</span>
          <span class="token comment">// --- End of placement settings ---</span>
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

<!-- TODO -->

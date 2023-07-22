# Circles placement strategy

## Description

Circles placement strategy is very **similar** to the [circle](pages/placement/circle.md) placement strategy described on the previous page. The **only difference** is that it places **vertices from disjoint graphs** on **separate circles**. These **circles** are positioned **next to each other** then.

> [!NOTE]
> This strategy always gives **the same** result for **directed and undirected** graphs.

## Properties

> All properties (except the `strategy`) are the same as for the [circle](pages/placement/circle?id=properties) placement strategy.

#### `strategy`

A required field specifying the strategy to use.

| Type      | Default | Required |
| --------- | ------- | -------- |
| 'circles' | -       | yes      |

#### `minVertexSpacing`

Specifies the minimum distance between vertices.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 20      | no       |

#### `sortVertices`

Determines whether graph vertices should be arranged in a circular layout based on specific relative order. Vertices will be sorted separately for each circle (each graph component).

| Type    | Default | Required |
| ------- | ------- | -------- |
| boolean | false   | no       |

> [!NOTE]
> If this property is set to `true` without specifying the custom `sortComparator`, vertices will be sorted by their keys in a non-decreasing order.

#### `sortComparator`

Specifies how vertices should be ordered on each circle. The function must be a reanimated `'worklet'`, because all layout calculations are processed on the UI thread.

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

## Example

**Code snippet**

```tsx
...
import { useWorkletCallback } from 'react-native-reanimated';

export default function Graph() {
  ...
  const sortComparator = useWorkletCallback(
    (a: string, b: string) => b.localeCompare(a),
    []
  );

  return (
    <GraphView objectFit='contain' padding={50}>
      <DirectedGraphComponent
        settings={{
          ...
          placement: {
            strategy: 'circles',
            minVertexSpacing: 150,
            sortVertices: true,
            sortComparator
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
  DirectedGraphData<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent
<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-smart-graph'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token constant">GRAPH</span><span class="token operator">:</span> DirectedGraphData <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">vertices</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V9'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V3'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V1'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V5'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V5'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E8'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> sortComparator <span class="token operator">=</span> <span class="token function">useWorkletCallback</span><span class="token punctuation">(</span>
    <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">a</span><span class="token operator">:</span> string<span class="token punctuation">,</span> <span class="token literal-property property">b</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> b<span class="token punctuation">.</span><span class="token function">localeCompare</span><span class="token punctuation">(</span>a<span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">[</span><span class="token punctuation">]</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
        <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          <span class="token comment">// --- Placement settings ---</span>
          <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'circles'</span><span class="token punctuation">,</span>
            <span class="token literal-property property">minVertexSpacing</span><span class="token operator">:</span> <span class="token number">150</span><span class="token punctuation">,</span>
            <span class="token literal-property property">sortVertices</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
            sortComparator
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

**Result**

<img src="./assets/images/placement/circles/placement-example.png" alt="circles placement example" width="300" />

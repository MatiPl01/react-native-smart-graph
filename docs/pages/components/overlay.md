# Overlay components

## Description

Overlay components are components **rendered over the canvas**. They have **access to canvas-related data** stored in **context** providing particular canvas functionalities.

Currently, there is only **one predefined** overlay component with **simple controls** (more details [below](pages/components/overlay?id=graphviewcontrols)).

You can write your **own overlay components** (explanation in [this](pages/components/overlay?id=custom-components) section). They are just **like plain React Native components** but have **access to canvas data**, thus can offer some **additional functionality**.

## Available components

### GraphViewControls

#### Description

This component displays **controls over the canvas**. These controls allow **resizing graph to the initial position** and **changing the objectFit** property of the [GraphView](pages/components/view.md) component.

#### Features

- Resettings **position** and **scale** of the graph container to **initial settings** (the graph is **re-centered** and the scale is changed to the [initialScale](pages/components/view?id=initialscale)),

- Changing the value of the [objectFit](pages/components/view?id=objectfit) property to the **next value**.

#### Properties

##### `onObjectFitChange`

A callback function called when the object fit change button is pressed. The button **is visible** only when this **callback is provided**.

This callback is passed the new `objectFit` value which can be then passed to the [GraphView](pages/components/view.md) component (see [this](pages/components/overlay?id=example) example).

| Type                           | Default | Required |
| ------------------------------ | ------- | -------- |
| (objectFit: ObjectFit) => void | -       | no       |

##### `style`

The `View` component style object. It will be passed to the underlying `View` component.

| Type                   | Default | Required |
| ---------------------- | ------- | -------- |
| StyleProp\<ViewStyle\> | -       | no       |

#### Example

**Code snippet**

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> StyleSheet<span class="token punctuation">,</span> Text<span class="token punctuation">,</span> View <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  GraphView<span class="token punctuation">,</span>
  DirectedGraphData<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  DirectedGraphComponent<span class="token punctuation">,</span>
  GraphViewControls<span class="token punctuation">,</span>
  ObjectFit
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
  <span class="token keyword">const</span> <span class="token punctuation">[</span>objectFit<span class="token punctuation">,</span> setObjectFit<span class="token punctuation">]</span> <span class="token operator">=</span> useState<span class="token operator">&lt;</span>ObjectFit<span class="token operator">&gt;</span><span class="token punctuation">(</span><span class="token string">'contain'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span>
        <span class="token attr-name">initialScale</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">0.5</span><span class="token punctuation">}</span></span>
        <span class="token attr-name">objectFit</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>objectFit<span class="token punctuation">}</span></span>
        <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">25</span><span class="token punctuation">}</span></span>
        <span class="token attr-name">scales</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">[</span><span class="token number">0.5</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">4</span><span class="token punctuation">]</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span> <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
        </span><span class="token punctuation">{</span><span class="token comment">/* --- GraphViewControls --- */</span><span class="token punctuation">}</span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphViewControls</span></span>
          <span class="token attr-name">onObjectFitChange</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>setObjectFit<span class="token punctuation">}</span></span>
          <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>controls<span class="token punctuation">}</span></span>
        <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
        </span><span class="token punctuation">{</span><span class="token comment">/* --- End of GraphViewControls --- */</span><span class="token punctuation">}</span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token punctuation">{</span><span class="token comment">/* Helper overlay to change dimensions */</span><span class="token punctuation">}</span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">View</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>overlay<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>objectFitText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">objectFit: '{objectFit}'</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">View</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> styles <span class="token operator">=</span> StyleSheet<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token comment">// --- GraphViewControls styles ---</span>
  <span class="token literal-property property">controls</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">position</span><span class="token operator">:</span> <span class="token string">'absolute'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">right</span><span class="token operator">:</span> <span class="token number">20</span><span class="token punctuation">,</span>
    <span class="token literal-property property">top</span><span class="token operator">:</span> <span class="token number">40</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token comment">// --- End of GraphViewControls styles ---</span>
  <span class="token literal-property property">overlay</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span>StyleSheet<span class="token punctuation">.</span>absoluteFillObject<span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'flex-end'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">pointerEvents</span><span class="token operator">:</span> <span class="token string">'box-none'</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">objectFitText</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">color</span><span class="token operator">:</span> <span class="token string">'white'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">fontSize</span><span class="token operator">:</span> <span class="token number">20</span><span class="token punctuation">,</span>
    <span class="token literal-property property">fontWeight</span><span class="token operator">:</span> <span class="token string">'bold'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">textAlign</span><span class="token operator">:</span> <span class="token string">'center'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">marginBottom</span><span class="token operator">:</span> <span class="token number">50</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

```tsx
...

export default function Graph() {
  const [objectFit, setObjectFit] = useState<ObjectFit>('contain');
  ...
  return (
    <>
      <GraphView
        ...
        objectFit={objectFit}>
        <DirectedGraphComponent graph={graph} />
        <GraphViewControls
          onObjectFitChange={setObjectFit}
          style={styles.controls}
        />
      </GraphView>
      ...
    </>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    right: 20,
    top: 40
  },
  ...
});
...
```

**Result**

<video src="./assets/videos/components/overlay/graph-view-controls-example.mp4" style="width: 300px"></video>

## Custom components

<!-- TODO - add this to documentation once the library code is polished and no more major changes to the inner logic will be made -->

> [!NOTE]
> This part of documentation will be **added later**, once the first stable version is released. Custom components touch parts of the **inner logic** which **might change**, so adding documentation for this part makes no sense for now.

> [!TIP]
> If you need to create your **custom component**, please look at the `GraphViewControls` component implementation and **experiment with** it to achieve the desired result.

# Random placement strategy

## Description

> This is a **default** placement strategy.

Random placement, as the name suggests, distributes vertices randomly on the screen. Vertices can be placed based on a predefined pattern or **fully random** (in this case, there is **no guarantee** that vertices do **not overlap**).

> [!NOTE]
> This strategy can give **different results** for **the same graph**, as the placement is random.

## Meshes explanation

Random placement can use one of **predefined meshes** to calculate **possible vertices placement positions**.

- **grid** - the mesh resembles a rectangular grid. The smallest segment of the mesh is a **square**.

| Visualization                                                       | Description                                                                                                                                                                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="./assets/images/placement/random/example-mesh-grid.png"/> | Dashed lines on the left side represent the **rectangular grid** that is created before assigning position to vertices. Positions are then **randomly picked** from the grid **lines cross points**. |

- **triangular** - the mesh is built with triangles.

| Visualization                                                             | Description                                                                                                                                                                                         |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="./assets/images/placement/random/example-mesh-triangular.png"/> | Dashed lines on the left side represent the **triangular grid** that is created before assigning position to vertices. Positions are then **randomly picked** from the grid **lines cross points**. |

## Properties

#### `strategy`

A required field specifying the strategy to use.

| Type     | Default | Required |
| -------- | ------- | -------- |
| 'random' | -       | yes      |

#### `mesh`

Specifies whether vertices should be randomly placed on a mesh or if the placement should be truly random.

| Type                                       | Default | Required |
| ------------------------------------------ | ------- | -------- |
| 'grid' &#124; 'triangular' &#124; 'random' | 'gird'  | no       |

<details>
<summary>Examples</summary>
<article>
<table>
  <tr>
    <th>'grid' (default)</th>
    <th>'triangular'</th>
    <th>'random'</th>
  </tr>
  <tr>
    <td><img src="./assets/images/placement/random/example-layout-type-grid.png"/></td>
    <td><img src="./assets/images/placement/random/example-layout-type-triangular.png"/></td>
    <td><img src="./assets/images/placement/random/example-layout-type-random.png"/></td>
  </tr>
</table>
</article>
</details>

#### `minVertexSpacing` (when `mesh` is <ins>not</ins> set to `'random'`)

Specifies the minimum distance between vertices (the **minimum distance** between mesh **cross points**).

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 20      | no       |

#### `density` (when `mesh` is <ins>not</ins> set to `'random'`)

Determines how dense will the mesh be. The **greater** the number is the **more dense** the mesh.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 0.5     | no       |

<details>
<summary>Examples</summary>
<article>
In the example below, the <strong>default</strong> mesh is used.
<br />
<table>
  <tr>
    <th>0.1</th>
    <th>0.5 (default)</th>
    <th>1</th>
  </tr>
  <tr>
    <td><img src="./assets/images/placement/random/example-density-0.1.png"/></td>
    <td><img src="./assets/images/placement/random/example-density-0.5.png"/></td>
    <td><img src="./assets/images/placement/random/example-density-1.png"/></td>
  </tr>
</table>
</article>
</details>

#### `containerWidth` (when `mesh` is set to `'random'`)

Specifies what is the **width** of the container which the `x` coordinate will be randomly chosen from.

| Type   | Default        | Required |
| ------ | -------------- | -------- |
| number | _window width_ | no       |

#### `containerHeight` (when `mesh` is set to `'random'`)

Specifies what is the **height\*\*** of the container which the `y` coordinate will be randomly chosen from.

| Type   | Default         | Required |
| ------ | --------------- | -------- |
| number | _window height_ | no       |

## Examples

### Random mesh container size

**Code snippet**

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> Dimensions<span class="token punctuation">,</span> StyleSheet<span class="token punctuation">,</span> Text<span class="token punctuation">,</span> View <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> TouchableOpacity <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-gesture-handler'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  DirectedGraphData<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  GraphView<span class="token punctuation">,</span>
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
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V5'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V5'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>containerDimensions<span class="token punctuation">,</span> setContainerDimensions<span class="token punctuation">]</span> <span class="token operator">=</span> useState<span class="token operator">&lt;</span><span class="token punctuation">{</span>
    containerHeight<span class="token operator">?</span><span class="token operator">:</span> number<span class="token punctuation">;</span>
    containerWidth<span class="token operator">?</span><span class="token operator">:</span> number<span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token operator">&gt;</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token punctuation">{</span> width<span class="token punctuation">,</span> height <span class="token punctuation">}</span> <span class="token operator">=</span> Dimensions<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">'window'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">handlePress</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token function">setContainerDimensions</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      <span class="token literal-property property">containerHeight</span><span class="token operator">:</span> Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> height<span class="token punctuation">,</span>
      <span class="token literal-property property">containerWidth</span><span class="token operator">:</span> Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> width
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
          <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
            <span class="token comment">// --- Placement settings ---</span>
            <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
              <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'random'</span><span class="token punctuation">,</span>
              <span class="token literal-property property">mesh</span><span class="token operator">:</span> <span class="token string">'random'</span><span class="token punctuation">,</span>
              <span class="token operator">...</span>containerDimensions
            <span class="token punctuation">}</span>
            <span class="token comment">// --- End of placement settings ---</span>
          <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
          <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
        <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token punctuation">{</span><span class="token comment">/* Helper overlay to change dimensions */</span><span class="token punctuation">}</span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">View</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>overlay<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">View</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>dimensionsContainer<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>dimensionsText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
            Width:</span><span class="token punctuation">{</span><span class="token string">'  '</span><span class="token punctuation">}</span><span class="token plain-text">
            </span><span class="token punctuation">{</span>containerDimensions<span class="token punctuation">.</span>containerWidth<span class="token operator">?.</span><span class="token function">toFixed</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span> <span class="token operator">??</span> <span class="token string">'window width'</span><span class="token punctuation">}</span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>dimensionsText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
            Height:</span><span class="token punctuation">{</span><span class="token string">' '</span><span class="token punctuation">}</span><span class="token plain-text">
            </span><span class="token punctuation">{</span>containerDimensions<span class="token punctuation">.</span>containerHeight<span class="token operator">?.</span><span class="token function">toFixed</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span> <span class="token operator">??</span> <span class="token string">'window height'</span><span class="token punctuation">}</span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">View</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">TouchableOpacity</span></span> <span class="token attr-name">onPress</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>handlePress<span class="token punctuation">}</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>button<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>buttonText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">Change dimensions</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">TouchableOpacity</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">View</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> styles <span class="token operator">=</span> StyleSheet<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token literal-property property">overlay</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span>StyleSheet<span class="token punctuation">.</span>absoluteFillObject<span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'flex-end'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">pointerEvents</span><span class="token operator">:</span> <span class="token string">'box-none'</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">dimensionsContainer</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">marginHorizontal</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
    <span class="token literal-property property">marginBottom</span><span class="token operator">:</span> <span class="token number">20</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">dimensionsText</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">fontSize</span><span class="token operator">:</span> <span class="token number">20</span><span class="token punctuation">,</span>
    <span class="token literal-property property">color</span><span class="token operator">:</span> <span class="token string">'#fff'</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">button</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">backgroundColor</span><span class="token operator">:</span> <span class="token string">'#edcf46'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">borderRadius</span><span class="token operator">:</span> <span class="token number">5</span><span class="token punctuation">,</span>
    <span class="token literal-property property">padding</span><span class="token operator">:</span> <span class="token number">10</span><span class="token punctuation">,</span>
    <span class="token literal-property property">marginBottom</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span>
    <span class="token literal-property property">marginHorizontal</span><span class="token operator">:</span> <span class="token number">50</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">buttonText</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">fontSize</span><span class="token operator">:</span> <span class="token number">20</span><span class="token punctuation">,</span>
    <span class="token literal-property property">fontWeight</span><span class="token operator">:</span> <span class="token string">'bold'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">textAlign</span><span class="token operator">:</span> <span class="token string">'center'</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

```tsx
...

export default function Graph() {
  ...
  return (
    ...
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          settings={{
            ...
            placement: {
              strategy: 'random',
              mesh: 'random',
              ...containerDimensions
            }
            ...
          }}
          ...
        />
      </GraphView>
      ...
  );
}
```

**Result**

<video src="./assets/videos/placement/random/random-container-size-example.mp4" style="width: 300px"></video>

> [!NOTE]
> In both examples, the graph placement **changes on each container dimensions change**. This happens because the graph has to **recalculate vertices placement positions** and **select positions randomly** from the **new container dimensions**.

### Mesh density

**Code snippet**

<details>
<summary>Show full code</summary>
<article>

<pre v-pre="" data-lang="tsx"><code class="lang-tsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useMemo<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> StyleSheet<span class="token punctuation">,</span> Text<span class="token punctuation">,</span> View <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> TouchableOpacity <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react-native-gesture-handler'</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span>
  DirectedGraphData<span class="token punctuation">,</span>
  DirectedGraph<span class="token punctuation">,</span>
  GraphView<span class="token punctuation">,</span>
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
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">edges</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E1'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V2'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E2'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V3'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E3'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V4'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E4'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V2'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V5'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E5'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V5'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V6'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E6'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V1'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V7'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">key</span><span class="token operator">:</span> <span class="token string">'E7'</span><span class="token punctuation">,</span> <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">'V5'</span><span class="token punctuation">,</span> <span class="token literal-property property">to</span><span class="token operator">:</span> <span class="token string">'V8'</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">Graph</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>density<span class="token punctuation">,</span> setDensity<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0.5</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> graph <span class="token operator">=</span> <span class="token function">useMemo</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">new</span> <span class="token class-name">DirectedGraph</span><span class="token punctuation">(</span><span class="token constant">GRAPH</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">increaseDensity</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span>
    <span class="token function">setDensity</span><span class="token punctuation">(</span><span class="token parameter">prev</span> <span class="token operator">=&gt;</span> Math<span class="token punctuation">.</span><span class="token function">min</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token number">10</span> <span class="token operator">*</span> prev <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token function-variable function">decreaseDensity</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span>
    <span class="token function">setDensity</span><span class="token punctuation">(</span><span class="token parameter">prev</span> <span class="token operator">=&gt;</span> Math<span class="token punctuation">.</span><span class="token function">max</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">round</span><span class="token punctuation">(</span><span class="token number">10</span> <span class="token operator">*</span> prev <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">0.1</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">GraphView</span></span> <span class="token attr-name">objectFit</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">'</span>contain<span class="token punctuation">'</span></span> <span class="token attr-name">padding</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token number">50</span><span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">DirectedGraphComponent</span></span>
          <span class="token attr-name">settings</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
            <span class="token comment">// --- Placement settings ---</span>
            <span class="token literal-property property">placement</span><span class="token operator">:</span> <span class="token punctuation">{</span>
              <span class="token literal-property property">strategy</span><span class="token operator">:</span> <span class="token string">'random'</span><span class="token punctuation">,</span>
              density
            <span class="token punctuation">}</span>
            <span class="token comment">// --- End of placement settings ---</span>
          <span class="token punctuation">}</span><span class="token punctuation">}</span></span>
          <span class="token attr-name">graph</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>graph<span class="token punctuation">}</span></span>
        <span class="token punctuation">/&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">GraphView</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token punctuation">{</span><span class="token comment">/* Helper overlay to change dimensions */</span><span class="token punctuation">}</span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">View</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>overlay<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">View</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>buttonsContainer<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">TouchableOpacity</span></span> <span class="token attr-name">onPress</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>decreaseDensity<span class="token punctuation">}</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>button<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>buttonText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">-</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">TouchableOpacity</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>densityText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token punctuation">{</span>density<span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">TouchableOpacity</span></span> <span class="token attr-name">onPress</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>increaseDensity<span class="token punctuation">}</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>button<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
            </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Text</span></span> <span class="token attr-name">style</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span>styles<span class="token punctuation">.</span>buttonText<span class="token punctuation">}</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">+</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Text</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
          </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">TouchableOpacity</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">View</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">View</span></span><span class="token punctuation">&gt;</span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span></span><span class="token punctuation">&gt;</span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> styles <span class="token operator">=</span> StyleSheet<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token literal-property property">overlay</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span>StyleSheet<span class="token punctuation">.</span>absoluteFillObject<span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'flex-end'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">pointerEvents</span><span class="token operator">:</span> <span class="token string">'box-none'</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">buttonsContainer</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">flexDirection</span><span class="token operator">:</span> <span class="token string">'row'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'center'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">alignItems</span><span class="token operator">:</span> <span class="token string">'center'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">marginBottom</span><span class="token operator">:</span> <span class="token number">50</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">button</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">backgroundColor</span><span class="token operator">:</span> <span class="token string">'#edcf46'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">width</span><span class="token operator">:</span> <span class="token number">40</span><span class="token punctuation">,</span>
    <span class="token literal-property property">height</span><span class="token operator">:</span> <span class="token number">40</span><span class="token punctuation">,</span>
    <span class="token literal-property property">justifyContent</span><span class="token operator">:</span> <span class="token string">'center'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">borderRadius</span><span class="token operator">:</span> <span class="token number">5</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">buttonText</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">fontSize</span><span class="token operator">:</span> <span class="token number">30</span><span class="token punctuation">,</span>
    <span class="token literal-property property">lineHeight</span><span class="token operator">:</span> <span class="token number">30</span><span class="token punctuation">,</span>
    <span class="token literal-property property">fontWeight</span><span class="token operator">:</span> <span class="token string">'bold'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">textAlign</span><span class="token operator">:</span> <span class="token string">'center'</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token literal-property property">densityText</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">fontSize</span><span class="token operator">:</span> <span class="token number">30</span><span class="token punctuation">,</span>
    <span class="token literal-property property">color</span><span class="token operator">:</span> <span class="token string">'#fff'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">fontWeight</span><span class="token operator">:</span> <span class="token string">'bold'</span><span class="token punctuation">,</span>
    <span class="token literal-property property">width</span><span class="token operator">:</span> <span class="token number">75</span><span class="token punctuation">,</span>
    <span class="token literal-property property">textAlign</span><span class="token operator">:</span> <span class="token string">'center'</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code><button class="docsify-copy-code-button"><span class="label"><svg><use href="assets/icons.svg#copy"></use></svg></span><span class="error">Error</span><span class="success">Copied</span></button></pre>

</article>
</details>

```tsx
...

export default function Graph() {
  ...
  return (
    ...
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          settings={{
            ...
            placement: {
              strategy: 'random',
              density
            }
            ...
          }}
          ...
        />
      </GraphView>
    ...
  );
}
```

**Result**

<video src="./assets/videos/placement/random/density-change-example.mp4" style="width: 300px"></video>

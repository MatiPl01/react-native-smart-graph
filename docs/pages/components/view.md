# GraphView

## Description

`GraphView` is a wrapper component designed to provide an interactive and dynamic canvas for graphical representations of graphs. It is responsible for rendering a graph component on canvas and supports multiple user gestures.

## Features

- **Canvas Rendering**: Manages the initialization and rendering of graphs on the canvas,
- **Gestures Support**: Supports a variety of touch gestures including panning, pinching, and double-tapping,
- **Responsive Resizing**: Dynamically adjusts the canvas size based on the provided objectFit value,

## Usage

**Example code**

```tsx
import { GraphView } from 'react-native-smart-graph';

export default function Graph() {
  return (
    <GraphView>
      {/* 
        Put your graph component code here
      */}
    </GraphView>
  );
}
```

## Properties

#### `objectFit`

Adjusts the size of the graph component rendered on the canvas. If value is different than `none`, the graph component will be automatically resized and translated to match its container.

| Type                                   | Default | Required |
| -------------------------------------- | ------- | -------- |
| 'none' &#124; 'contain' &#124; 'cover' | 'none'  | no       |

<details>
<summary>Examples</summary>
<article>
<table>
  <tr>
    <th>'none'</th>
    <th>'contain'</th>
    <th>'cover'</th>
  </tr>
  <tr>
    <td><img src="./assets/images/components/GraphView/object-fit-none.png" alt="objectFit none example" /></td>
    <td><img src="./assets/images/components/GraphView/object-fit-contain.png" alt="objectFit contain example" /></td>
    <td><img src="./assets/images/components/GraphView/object-fit-cover.png" alt="objectFit cover example" /></td>
  </tr>
</table>
</article>
</details>

#### `padding`

Adds padding to the graph container on the specific sides. You can specify padding in one of 3 possible ways:

- by passing a **number** - the same padding will be added to each container side,
- by specifying vertical and/or horizontal padding,
- by specifying padding separately for each container side.

```ts
type Spacing =
  | number
  | { horizontal?: number; vertical?: number }
  | { left?: number; right?: number; top?: number; bottom?: number };
```

| Type    | Default | Required |
| ------- | ------- | -------- |
| Spacing | 0       | no       |

<details>
<summary>Examples</summary>
<article>
<strong>Adding padding to all 4 sides</strong>
<table>
  <tr>
    <th>0    </th>
    <th>100</th>
    <th>500</th>
  </tr>
  <tr>
    <td><img src="./assets/images/components/GraphView/padding-0-contain.png" alt="padding 0 example" /></td>
    <td><img src="./assets/images/components/GraphView/padding-100-contain.png" alt="padding 100 example" /></td>
    <td><img src="./assets/images/components/GraphView/padding-500-contain.png" alt="padding 500 example" /></td>
  </tr>
</table>

<div class="alert callout note">
<p class="title"><span class="icon icon-note"></span>Note</p>
<p>In the example above the <code>objectFit</code> property was set to <code>'contain'</code>. When it is set to <code>'none'</code>, adding padding to all 4 sides od the graph container will not be visible during the initial render because the scale of the container is calculated based on the <code>initialScale</code> property.</p> Even if not visible, padding is added, which can be noticed while panning the canvas.
</div>

<strong>Adding padding separately to each side</strong>

<table>
  <tr>
    <th>{ left: 500 }</th>
    <th>{ right: 500 }</th>
    <th>{ top: 500 }</th>
    <th>{ bottom: 500 }</th>
  </tr>
  <tr>
    <td><img src="./assets/images/components/GraphView/padding-left.png" alt="padding left example" /></td>
    <td><img src="./assets/images/components/GraphView/padding-right.png" alt="padding right example" /></td>
    <td><img src="./assets/images/components/GraphView/padding-top.png" alt="padding top example" /></td>
    <td><img src="./assets/images/components/GraphView/padding-bottom.png" alt="padding bottom example" /></td>
  </tr>
</table>
</article>
</details>

#### `scales`

This property specifies **scale thresholds**. The **first** value in the array is the **minimum** possible scale of the canvas, and the **last** one is the **maximum** possible scale. If more than 2 values are used, **intermediate values** will be used as successive thresholds when resizing the canvas on the **double tap** gesture.

If at least **3 scale values** are provided, the **second** value (at index 1) will be used as the default scale value on the **double tap** gesture triggered resizing.

If less than **3 scale values** are provided, the **first** one will be used as the default scale value on the **double tap** gesture triggered resizing.

| Type     | Default         | Required |
| -------- | --------------- | -------- |
| number[] | [0.25, 1, 2, 4] | no       |

<details>
<summary>Examples</summary>
<article>
<table>
  <tr>
    <th>min scale (0.25)</th>
    <th>max scale (4)</th>
    <th>intermediate (1, 2, 4)</th>
  </tr>
  <tr>
    <td><img src="./assets/images/components/GraphView/scale-min.gif" alt="minimum scale example" /></td>
    <td><img src="./assets/images/components/GraphView/scale-max.gif" alt="maximum scale example" /></td>
    <td><img src="./assets/images/components/GraphView/scale-intermediate.gif" alt="intermediate scales example" /></td>
  </tr>
</table>
</article>
</details>

> [!WARNING]
> Scales in the array must be sorted in an increasing order.

#### `initialScale`

Specifies the initial scale of the graph component relative to the canvas dimensions.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 1       | no       |

> [!NOTE]
> The `GraphView` component always occupies all the available space of the parent container, so the canvas will be the same size as the parent container.

#### `autoSizingTimeout`

Specifies how long after user inactivity (no gestures, no vertex focus, etc.) the graph container will start resizing automatically.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 2000    | no       |

> [!NOTE]
> This property takes no effect if used with `objectFit` property set to `none` because in that case the container is not automatically resized.

## Gestures

- **Pan gesture** - Activated by dragging one finger on the screen, enabling the translation of the canvas,

- **Pinch gesture** - By moving two fingers together or apart on the screen, users can zoom in or out on the canvas,

- **Double tap gesture** - Quickly tapping twice on the canvas triggers a zoom in/out effect precisely where the canvas was tapped.

<details>
<summary>Examples</summary>
<article>
<table>
  <tr>
    <th>pan</th>
    <th>pinch</th>
    <th>double tap</th>
  </tr>
  <tr>
    <td><video src="./assets/videos/components/GraphView/gesture-pan.mp4"></video></td>
    <td><video src="./assets/videos/components/GraphView/gesture-pinch.mp4"></video></td>
    <td><video src="./assets/videos/components/GraphView/gesture-double-tap.mp4"></video></td>
  </tr>
</table>
</article>
</details>

## Example

**Example code**

The code snippet below presents the usage of all described properties combined together.

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
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V3', to: 'V1' }
  ]
};

export default function Graph() {
  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  return (
    <GraphView
      padding={{
        top: 100,
        right: 200
      }}
      autoSizingTimeout={3000}
      initialScale={0.5}
      objectFit='contain'
      scales={[0.5, 1, 2]}>
      <DirectedGraphComponent
        settings={{
          placement: {
            strategy: 'circle',
            minVertexSpacing: 150
          }
        }}
        graph={graph}
      />
    </GraphView>
  );
}
```

> [!NOTE]
> The placement strategy of the `DirectedGraphComponent` component was set to `'circle'` to ensure that the displayed result will always be the same. For more details about graph placement strategies visit [this](pages/placement/circle.md) section of documentation.

**Result**

<video src="./assets/videos/components/GraphView/graph-view-example.mp4" style="width: 300px"></video>

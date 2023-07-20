# GraphView

`GraphView` is a wrapper component designed to provide an interactive and dynamic canvas for graphical representations of graphs. It is responsible for rendering a graph component on canvas and supports multiple user gestures.

## Features

- **Canvas Rendering**: Manages the initialization and rendering of graphs on the canvas,

- **Gestures Support**: Supports a variety of touch gestures including panning, pinching, and double-tapping,

- **Responsive Resizing**: Dynamically adjusts the canvas size based on the provided objectFit value,

## Usage

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

#### `scales`

This property specifies **scale thresholds**. The **first** value in the array is the **minimum** possible scale of the canvas, and the **last** one is the **maximum** possible scale. If more than 2 values are used, **intermediate values** will be used as successive thresholds when resizing the canvas on the **double tap** gesture.

If at least **3 scale values** are provided, the **second** value (at index 1) will be used as the default scale value on the **double tap** gesture triggered resizing.

If less than **3 scale values** are provided, the **first** one will be used as the default scale value on the **double tap** gesture triggered resizing.

| Type     | Default         | Required |
| -------- | --------------- | -------- |
| number[] | [0.25, 1, 2, 4] | no       |

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

## Example

<!-- TODO - add examples -->
<!-- <details>
<summary>Example</summary>
  <p>This is a super cool paragraph</p>
  <small>This is a super cool small paragraph</small>
  <b>Veni Vidi Vici</b>
</details> -->

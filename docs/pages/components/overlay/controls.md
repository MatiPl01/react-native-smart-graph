# GraphViewControls

## Description

This component displays **controls over the canvas**. These controls allow **resizing graph to the initial position** and **changing the objectFit** property of the [GraphView](pages/components/view) component.

## Features

- Resettings **position** and **scale** of the graph container to **initial settings** (the graph is **re-centered** and the scale is changed to the [initialScale](pages/components/view?id=initialscale)),
<!-- TODO - this link redirects to the current page but scrolls to wrong position -->

- Changing the value of the [objectFit](pages/components/view?id=objectfit) property to the **next value**.

## Properties

#### `onObjectFitChange`

A callback function called when the object fit change button is pressed. The button **is visible** only when this **callback is provided**.

This callback is passed the new `objectFit` value which can be then passed to the [GraphView](pages/components/view) component (see [this](pages/components/overlay?id=example) example).

| Type                           | Default | Required |
| ------------------------------ | ------- | -------- |
| (objectFit: ObjectFit) => void | -       | no       |

#### `style`

The `View` component style object. It will be passed to the underlying `View` component.

| Type                   | Default | Required |
| ---------------------- | ------- | -------- |
| StyleProp\<ViewStyle\> | -       | no       |

## Example

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GraphView,
  DirectedGraphData,
  DirectedGraph,
  DirectedGraphComponent,
  GraphViewControls,
  ObjectFit
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
  const [objectFit, setObjectFit] = useState<ObjectFit>('contain');

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  return (
    <>
      <GraphView
        initialScale={0.5}
        objectFit={objectFit}
        padding={25}
        scales={[0.5, 1, 4]}>
        <DirectedGraphComponent graph={graph} />
        {/* --- GraphViewControls --- */}
        <GraphViewControls
          onObjectFitChange={setObjectFit}
          style={styles.controls}
        />
        {/* --- End of GraphViewControls --- */}
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <Text style={styles.objectFitText}>objectFit: '{objectFit}'</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // --- GraphViewControls styles ---
  controls: {
    position: 'absolute',
    right: 20,
    top: 40
  },
  // --- End of GraphViewControls styles ---
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none'
  },
  objectFitText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50
  }
});
```

<!-- accordion:end -->

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

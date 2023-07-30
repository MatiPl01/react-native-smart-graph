# Overlay components

## Description

Overlay components are components **rendered over the canvas**. They have **access to canvas-related data** stored in **context** providing particular canvas functionalities.

Currently, there is only **one predefined** overlay component with **simple controls** (more details [below](pages/components/overlay?id=graphviewcontrols)).

You can write your **own overlay components** (explanation in [this](pages/components/overlay?id=custom-components) section). They are just **like plain React Native components** but have **access to canvas data**, thus can offer some **additional functionality**.

## Available components

### GraphViewControls

#### Description

This component displays **controls over the canvas**. These controls allow **resizing graph to the initial position** and **changing the objectFit** property of the [GraphView](pages/components/view) component.

#### Features

- Resettings **position** and **scale** of the graph container to **initial settings** (the graph is **re-centered** and the scale is changed to the [initialScale](pages/components/view?id=initialscale)),
<!-- TODO - this link redirects to the current page but scrolls to wrong position -->

- Changing the value of the [objectFit](pages/components/view?id=objectfit) property to the **next value**.

#### Properties

##### `onObjectFitChange`

A callback function called when the object fit change button is pressed. The button **is visible** only when this **callback is provided**.

This callback is passed the new `objectFit` value which can be then passed to the [GraphView](pages/components/view) component (see [this](pages/components/overlay?id=example) example).

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

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  GraphView,
  UndirectedGraphData,
  UndirectedGraph,
  UndirectedGraphComponent,
  DefaultEdgeLabelRenderer
} from 'react-native-smart-graph';

const GRAPH: UndirectedGraphData = {
  vertices: [{ key: 'V1' }, { key: 'V2' }, { key: 'V3' }],
  edges: [
    { key: 'E1', vertices: ['V1', 'V2'] },
    { key: 'E2', vertices: ['V2', 'V3'] },
    { key: 'E3', vertices: ['V3', 'V1'] },
    { key: 'E4', vertices: ['V1', 'V3'] },
    { key: 'E5', vertices: ['V3', 'V2'] },
    { key: 'E6', vertices: ['V1', 'V3'] }
  ]
};

export default function Graph() {
  const [showLabels, setShowLabels] = useState(true);

  const graph = useMemo(() => new UndirectedGraph(GRAPH), []);

  const toggleLabels = () => setShowLabels(!showLabels);

  return (
    <>
      <GraphView objectFit='contain' padding={25}>
        <UndirectedGraphComponent
          renderers={{
            label: showLabels ? DefaultEdgeLabelRenderer : undefined
          }}
          settings={{
            placement: {
              strategy: 'circle',
              minVertexSpacing: 100
            }
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <TouchableOpacity onPress={toggleLabels} style={styles.button}>
          <Text style={styles.buttonText}>
            {showLabels ? 'Hide' : 'Show'} labels
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#edcf46',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 50,
    paddingHorizontal: 25,
    paddingVertical: 10
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
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

## Custom components

<!-- TODO - add this to documentation once the library code is polished and no more major changes to the inner logic will be made -->

> [!NOTE]
> This part of documentation will be **added later**, once the first stable version is released. Custom components touch parts of the **inner logic** which **might change**, so adding documentation for this part makes no sense for now.

> [!TIP]
> If you need to create your **custom component**, please look at the `GraphViewControls` component implementation and **experiment with** it to achieve the desired result.

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

<!-- accordion:start -->

#### _Examples_

| 'grid' (default)                                                           | 'triangular'                                                                     | 'random'                                                                     |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| <img src="./assets/images/placement/random/example-layout-type-grid.png"/> | <img src="./assets/images/placement/random/example-layout-type-triangular.png"/> | <img src="./assets/images/placement/random/example-layout-type-random.png"/> |

<!-- accordion:end -->

#### `minVertexDistance` (when `mesh` is <ins>not</ins> set to `'random'`)

Specifies the minimum distance between vertices (the **minimum distance** between mesh **cross points**).

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 20      | no       |

#### `density` (when `mesh` is <ins>not</ins> set to `'random'`)

Determines how dense will the mesh be. The **greater** the number is the **more dense** the mesh.

| Type   | Default | Required |
| ------ | ------- | -------- |
| number | 0.5     | no       |

<!-- accordion:start -->

#### _Examples_

| 0.1                                                                   | 0.5 (default)                                                         | 1                                                                   |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| <img src="./assets/images/placement/random/example-density-0.1.png"/> | <img src="./assets/images/placement/random/example-density-0.5.png"/> | <img src="./assets/images/placement/random/example-density-1.png"/> |

<!-- accordion:end -->

#### `containerWidth` (when `mesh` is set to `'random'`)

Specifies what is the **width** of the container which the `x` coordinate will be randomly chosen from.

| Type   | Default        | Required |
| ------ | -------------- | -------- |
| number | _canvas width_ | no       |

#### `containerHeight` (when `mesh` is set to `'random'`)

Specifies what is the **height\*\*** of the container which the `y` coordinate will be randomly chosen from.

| Type   | Default         | Required |
| ------ | --------------- | -------- |
| number | _canvas height_ | no       |

## Examples

### Random mesh container size

**Code snippet**

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  DirectedGraphData,
  DirectedGraph,
  GraphView,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' }
  ],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V4' },
    { key: 'E4', from: 'V2', to: 'V5' },
    { key: 'E5', from: 'V5', to: 'V6' },
    { key: 'E6', from: 'V1', to: 'V7' },
    { key: 'E7', from: 'V5', to: 'V8' }
  ]
};

export default function Graph() {
  const [containerDimensions, setContainerDimensions] = useState<{
    containerHeight?: number;
    containerWidth?: number;
  }>({});

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const { width, height } = Dimensions.get('window');

  const handlePress = () => {
    setContainerDimensions({
      containerHeight: Math.random() * height,
      containerWidth: Math.random() * width
    });
  };

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          settings={{
            // --- Placement settings ---
            placement: {
              strategy: 'random',
              mesh: 'random',
              ...containerDimensions
            }
            // --- End of placement settings ---
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.dimensionsContainer}>
          <Text style={styles.dimensionsText}>
            Width:{'  '}
            {containerDimensions.containerWidth?.toFixed(2) ?? 'window width'}
          </Text>
          <Text style={styles.dimensionsText}>
            Height:{' '}
            {containerDimensions.containerHeight?.toFixed(2) ?? 'window height'}
          </Text>
        </View>
        <TouchableOpacity onPress={handlePress} style={styles.button}>
          <Text style={styles.buttonText}>Change dimensions</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none'
  },
  dimensionsContainer: {
    marginHorizontal: 50,
    marginBottom: 20
  },
  dimensionsText: {
    fontSize: 20,
    color: '#fff'
  },
  button: {
    backgroundColor: '#edcf46',
    borderRadius: 5,
    padding: 10,
    marginBottom: 50,
    marginHorizontal: 50
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
```

<!-- accordion:end -->

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

<!-- accordion:start -->

#### _Show full code_

```tsx
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  DirectedGraphData,
  DirectedGraph,
  GraphView,
  DirectedGraphComponent
} from 'react-native-smart-graph';

const GRAPH: DirectedGraphData = {
  vertices: [
    { key: 'V1' },
    { key: 'V2' },
    { key: 'V3' },
    { key: 'V4' },
    { key: 'V5' },
    { key: 'V6' },
    { key: 'V7' },
    { key: 'V8' }
  ],
  edges: [
    { key: 'E1', from: 'V1', to: 'V2' },
    { key: 'E2', from: 'V2', to: 'V3' },
    { key: 'E3', from: 'V2', to: 'V4' },
    { key: 'E4', from: 'V2', to: 'V5' },
    { key: 'E5', from: 'V5', to: 'V6' },
    { key: 'E6', from: 'V1', to: 'V7' },
    { key: 'E7', from: 'V5', to: 'V8' }
  ]
};

export default function Graph() {
  const [density, setDensity] = useState(0.5);

  const graph = useMemo(() => new DirectedGraph(GRAPH), []);

  const increaseDensity = () =>
    setDensity(prev => Math.min(Math.round(10 * prev + 1) / 10, 1));
  const decreaseDensity = () =>
    setDensity(prev => Math.max(Math.round(10 * prev - 1) / 10, 0.1));

  return (
    <>
      <GraphView objectFit='contain' padding={50}>
        <DirectedGraphComponent
          settings={{
            // --- Placement settings ---
            placement: {
              strategy: 'random',
              density
            }
            // --- End of placement settings ---
          }}
          graph={graph}
        />
      </GraphView>
      {/* Helper overlay to change dimensions */}
      <View style={styles.overlay}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={decreaseDensity} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.densityText}>{density}</Text>
          <TouchableOpacity onPress={increaseDensity} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50
  },
  button: {
    backgroundColor: '#edcf46',
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: 5
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  densityText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    width: 75,
    textAlign: 'center'
  }
});
```

<!-- accordion:end -->

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

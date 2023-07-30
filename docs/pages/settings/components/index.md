# Graph components settings

## Description

Graph components settings are settings related to the **appearance of graph components**. They are used to **properly calculate layout** an **customize** how particular parts of graph **look**.

If you need more **visual customization** options, please consider writing your own **graph component renderer** as described in [this](pages/renderers/index) page.

## Usage

Graph components settings can be specified via the `settings` property of the graph component. All components settings should be listed under the `components` property of the `settings` object (see the example below):

<!-- tabs:start -->

#### **Directed graph**

```tsx
<DirectedGraphComponent
  settings={{
    ...
    components: {
      /* Graph components settings */
    },
    ...
  }}
/>
```

#### **Undirected graph**

```tsx
<UndirectedGraphComponent
  settings={{
    ...
    components: {
      /* Graph components settings */
    },
    ...
  }}
/>
```

<!-- tabs:end -->

## Available settings

- [Vertex](pages/settings/components/vertex)
- [Edge](pages/settings/components/edge)
- [Edge label](pages/settings/components/label)
- [Directed edge arrow](pages/settings/components/arrow)

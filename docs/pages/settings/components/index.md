# Graph components settings

## Description

Graph components settings are settings related to the **appearance of graph components**. They are used to **properly calculate layout** an **customize** how particular parts of graph **look**.

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

## Properties

### Available settings

- [vertex](pages/settings/components/vertex)
- [edge](pages/settings/components/edge)

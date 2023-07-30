# Placement strategies

## Description

<!-- TODO - fix scroll to settings property header -->

The placement strategy determines the **relative position** of graph vertices. It is used for vertices positions calculations **based on certain conditions**, such as **relative connections** of vertices or some different criteria.

Depending on the graph you want to render, some strategies might be more applicable than others. For example, for tree-like graph structures, the best results will be achieved with the `trees` placement strategy.

The placement strategy can be set via the `settings` property of the graph component (more details in [this](pages/components/graphs?id=settings) section).

## Usage

Placement strategy can be specified via the `settings` property of the graph component. All placement strategy settings should be listed under the `placement` property of the `settings` object (see the example below):

<!-- tabs:start -->

#### **Directed graph**

```tsx
<DirectedGraphComponent
  settings={{
    ...
    placement: {
      /* Placement strategy settings */
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
    placement: {
      /* Placement strategy settings */
    },
    ...
  }}
/>
```

<!-- tabs:end -->

> [!NOTE]
> You can use the `UndirectedGraphComponent` instead of the `DirectedGraphComponent`. All strategies support undirected and directed graphs but the visual result might be different in some strategies dependent on connections of the vertices.

## Available placement strategies

- [Random](pages/settings/placement/random)
- [Circle](pages/settings/placement/circle)
- [Circles](pages/settings/placement/circles)
- [Trees](pages/settings/placement/trees)
- [Orbits](pages/settings/placement/orbits)

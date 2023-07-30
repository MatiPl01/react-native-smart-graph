# Edge component settings

## Description

Settings related to graph edges. They are used to

<!-- TODO - add description -->

## Usage

```ts
components: {
  ...
  edge: {
    /* Graph edge component settings */
  },
  ...
}
```

## Properties

#### `type`

Type of edge. Determines **how edges will be rendered** when **multiple edges**
are added **between a pair of vertices**.

| Type                       | Default    | Required |
| -------------------------- | ---------- | -------- |
| 'straight' &#124; 'curved' | 'straight' | no       |

#### `maxOffsetFactor` (`straight` edge only)

This property is used to set the **maximum distance** between the **outermost edges** between a pair of vertices. The resulting distance will be calculated
as the **product** of the `maxOffsetFactor` and the vertex `radius`.

| Type                       | Default    | Required |
| -------------------------- | ---------- | -------- |
| 'straight' &#124; 'curved' | 'straight' | no       |

## Example

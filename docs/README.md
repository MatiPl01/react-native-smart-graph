# Getting Started

## Features

- Directed and undirected graphs support,
- Multiple edges support (**straight** or **curved** edges),
- Smooth gesture interactions, panning and scaling support,
- Different placement strategies,
- Different layout types: **static** or **force-managed**,
- Easy to update graph models that allow changing the graph structure after render,
- Customizable graph components (each component can be defined by the user),
- Actions on vertex press,
- Vertex focus support (customizable scale and position of focused vertex).

## Installation

The library is dependent on a few other libraries that must be installed beforehand.

### Prerequisites

#### Peer Dependencies Installation

This library uses several external libraries that need to be installed beforehand. This libraries are required to build custom graph components, create custom animations and handle events.

Run one of the following commands, depending on your package manager:

- yarn

```sh
yarn add @shopify/react-native-skia react-native-reanimated react-native-gesture-handler react-native-svg
```

- npm

```sh
npm i @shopify/react-native-skia react-native-reanimated react-native-gesture-handler react-native-svg
```

#### Adding Reanimated Babel Plugin

Reanimated requires a `'react-native-reanimated/plugin'` Babel plugin to work. Your `babel.config.js` should look like this after change:

```js
module.exports = {
  presets: ...,
  plugins: [
    ...
    'react-native-reanimated/plugin'
    ]
  ]
};
```

#### Pods Installation (iOS Only)

Before running the app on the iOS device, you will have to take one more step and install required Pods:

```sh
npx pod-install ios
```

### Library Installation

To install the library itself, you'll need to run one of the commands below, depending on the package manager you're using in your project.

- yarn

```sh
yarn add react-native-smart-graph
```

- npm

```sh
npm i react-native-smart-graph
```

## Built With ❤️ and <!-- {docsify-ignore} -->

- [react-native-skia](https://shopify.github.io/react-native-skia/)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [@fortawesome/react-native-fontawesome](https://www.npmjs.com/package/@fortawesome/react-native-fontawesome)
- [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob)

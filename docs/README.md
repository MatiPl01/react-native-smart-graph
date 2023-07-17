# Getting Started

## Prerequisites

### Peer dependencies installation

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

### Adding Reanimated Babel plugin

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

### Pods installation (iOS only)

Before running the app on the iOS device, you will have to take one more step and install required Pods:

```sh
npx pod-install ios
```

## Installation

To install the library itself, you'll need to run one of the commands below, depending on the package manager you're using in your project.

- yarn

```sh
yarn add react-native-smart-graph
```

- npm

```sh
npm i react-native-smart-graph
```

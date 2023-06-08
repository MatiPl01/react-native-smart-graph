<a name="readme-top"></a>

<!-- PROJECT LOGO AND TITLE -->
<div align="center">
<img src="docs/images/logo-banner.png" width="800" />

# React Native Smart Graph

## Dynamic Graph Visualization for React Native

### Effortlessly create and interact with graph structures in your apps

</div>

<!-- TABLE OF CONTENTS -->
<br>
<h3>
<details>
  <summary>
    Table of Contents
  </summary>
  <h5>
    <ol>
      <li>
        <a href="#getting-started">Getting Started</a>
        <ul>
          <li><a href="#prerequisites">Prerequisites</a></li>
          <li><a href="#installation">Installation</a></li>
        </ul>
      </li>
    </ol>
  </h5>
</details>
</h3>

<!-- GETTING STARTED -->

## 📋 Getting Started

### Prerequisites

#### Peer dependencies installation

This library uses a few external libraries that you should install before installing the library. You will need these libraries to build custom graph components, create custom animations or handle events.

Run one of the following commands, depending on your package manager:

- yarn

```sh
yarn add @shopify/react-native-skia react-native-reanimated react-native-gesture-handler react-native-svg
```

- npm

```sh
npm i @shopify/react-native-skia react-native-reanimated react-native-gesture-handler react-native-svg
```

#### Adding Reanimated Babel plugin

You will also need to add the `'react-native-reanimated/plugin'` Babel plugin to make Reanimated. Your `babel.config.js` should look like this after change:

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

#### Pods installation (iOS only)

Before running the app on the iOS device, you will have to take one more step and install required Pods:

```sh
npx pod-install ios
```

### Installation

In order to install the library, you will need to run one of the following commands, depending on the package manager you use in your project. All required dependencies will be automatically installed.

- yarn

```sh
yarn add react-native-smart-graph
```

- npm

```sh
npm i react-native-smart-graph
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

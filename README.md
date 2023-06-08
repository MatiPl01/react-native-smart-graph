<a name="readme-top"></a>

<!-- PROJECT LOGO AND TITLE -->
<div align="center">
<img src="docs/images/logo-banner.png" width="800" />

# React Native Smart Graph

### Dynamic Graph Visualization for React Native

#### Effortlessly create and interact with graph structures in your apps

![npm](https://img.shields.io/npm/dw/react-native-smart-graph?color=ffd53e)
![GitHub issues](https://img.shields.io/github/issues/MatiPl01/react-native-smart-graph?color=ffd53e)
![GitHub contributors](https://img.shields.io/github/contributors/MatiPl01/react-native-smart-graph?color=ffd53e)
![GitHub Release Date](https://img.shields.io/github/release-date/MatiPl01/react-native-smart-graph?color=ffd53e)
![GitHub](https://img.shields.io/github/license/MatiPl01/react-native-smart-graph?color=ffd53e)

![GitHub forks](https://img.shields.io/github/forks/MatiPl01/react-native-smart-graph?style=social)
![GitHub Repo stars](https://img.shields.io/github/stars/MatiPl01/react-native-smart-graph?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/MatiPl01/react-native-smart-graph?style=social)

</div>

<!-- TABLE OF CONTENTS -->
<h3>
<details>
  <summary>
    Table of Contents
  </summary>
  <h5>
    <ol>
      <li>
        <p>
          <a href="#getting-started">Getting Started</a>
        </p>
        <ul>
          <li><a href="#prerequisites">Prerequisites</a></li>
          <li><a href="#installation">Installation</a></li>
        </ul>
      </li>
      <li>
        <p>
          <a href="#usage">Usage</a>
          <ul>
            <li><a href="#basic-usage">Basic usage</a></li>
            <li><a href="#graph-models">Graph models</a></li>
            <li><a href="#graph-components">Graph components</a></li>
            <li><a href="#custom-renderers">Creating custom renderers</a></li>
            <li><a href="#animations">Creating graph animations</a></li>
          </ul>
        </p>
      </li>
    </ol>
  </h5>
</details>
</h3>

<!-- GETTING STARTED -->
<h2 id="getting-started">⚙ Getting Started</h2>

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

<p align="right">(<a href="#readme-top">back to top</a>)</p>

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

<!-- BASIC USAGE -->
<!-- TODO -->
<h2 id="basic-usage">🤹 Basic Usage</h2>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

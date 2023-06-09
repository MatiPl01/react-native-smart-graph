import { NativeModules as RNNativeModules, View } from 'react-native';
import { createElement } from 'react';

RNNativeModules.UIManager = RNNativeModules.UIManager || {};
RNNativeModules.UIManager.RCTView = RNNativeModules.UIManager.RCTView || {};
RNNativeModules.RNGestureHandlerModule =
  RNNativeModules.RNGestureHandlerModule || {
    State: { BEGAN: 'BEGAN', FAILED: 'FAILED', ACTIVE: 'ACTIVE', END: 'END' },
    attachGestureHandler: jest.fn(),
    createGestureHandler: jest.fn(),
    dropGestureHandler: jest.fn(),
    updateGestureHandler: jest.fn()
  };

RNNativeModules.PlatformConstants = RNNativeModules.PlatformConstants || {
  forceTouchAvailable: false
};

const PlainView = ({ children, ...props }) =>
  createElement(View, props, children);
const noop = () => null;

jest.mock('@shopify/react-native-skia', () => {
  const mock = {
    // other props can be added which
    // aren't handled properly
    // by the handler
    Canvas: PlainView
  };
  const handler = {
    get(_, prop, __) {
      // first look for the prop in the mock
      if (prop in mock) {
        return mock[prop];
      }
      // class case? return a view
      if (prop[0] === prop[0].toUpperCase()) {
        return PlainView;
      }
      // probably a method
      return noop;
    }
  };
  return new Proxy(mock, handler);
});

jest.mock('src/assets/fonts/Rubik-Regular.ttf', () => 'Rubik-Regular.ttf');
jest.useFakeTimers();

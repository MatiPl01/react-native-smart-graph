import { createElement } from 'react';
import { NativeModules as RNNativeModules, View } from 'react-native';

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

jest.mock('@shopify/react-native-skia', () => {
  const noop = () => {};

  const mock = {
    // other props can be added which
    // aren't handled properly
    // by the handler
    Canvas: PlainView,
    Skia: {
      Font: jest.fn(),
      FontMgr: {
        System: () => ({
          matchFamilyStyle: jest.fn().mockReturnValue({
            name: 'Roboto',
            style: 'Bold'
          })
        })
      }
    }
  };

  const handler = {
    get: (_, prop, __) => {
      if (prop in mock) {
        return mock[prop];
      }
      if (prop[0] === prop[0].toUpperCase()) {
        return PlainView;
      }
      return noop;
    }
  };

  return new Proxy(mock, handler);
});

jest.useFakeTimers();

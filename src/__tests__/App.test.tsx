/**
 * @format
 */
import 'react-native';

import React from 'react';
// Note: test renderer must be required after react-native.
import { create } from 'react-test-renderer';

import App from '@/examples/Development';

it('renders correctly', () => {
  create(<App />);
});

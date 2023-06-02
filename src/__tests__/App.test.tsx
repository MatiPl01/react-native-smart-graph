/**
 * @format
 */
import 'react-native';

// Note: test renderer must be required after react-native.
import { create } from 'react-test-renderer';

import App from '@/examples/Development';

it('renders correctly', () => {
  create(<App />);
});

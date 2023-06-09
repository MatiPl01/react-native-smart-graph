// Note: test renderer must be required after react-native.
import { create } from 'react-test-renderer';

import Development from '@/examples/Development';

it('renders correctly', () => {
  create(<Development />);
});

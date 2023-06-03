/**
 * This file is the entry point for the tester app using the library.
 *
 * It is used to test if everything works properly.
 */
import { AppRegistry } from 'react-native';
import App from '@/examples/Development';

import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

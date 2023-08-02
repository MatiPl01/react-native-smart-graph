/**
 * This file is the main entry point for the local development server.
 *
 * It is used to test the library.
 */
import './wydr';

import { AppRegistry } from 'react-native';
import App from '@/App';

import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

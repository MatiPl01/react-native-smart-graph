import { FiberProvider } from 'its-fine'; // TODO - add to docs
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DataUpdatingExample from './examples/DataUpdatingExample';

export default function App() {
  return (
    <FiberProvider>
      <StatusBar barStyle='light-content' />
      <GestureHandlerRootView style={styles.container}>
        <DataUpdatingExample />
      </GestureHandlerRootView>
    </FiberProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1
  }
});

import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Graph from './examples/Graph.example';

export default function App() {
  return (
    <>
      <StatusBar barStyle='light-content' />
      <GestureHandlerRootView style={styles.container}>
        <Graph />
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1
  }
});

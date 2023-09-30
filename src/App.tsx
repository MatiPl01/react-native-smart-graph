import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import ResponsiveTextExample from './examples/ResponsiveText.example';

export default function App() {
  return (
    <>
      <StatusBar barStyle='light-content' />
      <GestureHandlerRootView style={styles.container}>
        <ResponsiveTextExample />
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

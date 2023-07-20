import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GraphViewPropsExample } from '.';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <GraphViewPropsExample />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  }
});

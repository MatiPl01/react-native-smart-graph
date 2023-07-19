import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { UndirectedGraphUsageExample } from '.';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <UndirectedGraphUsageExample />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

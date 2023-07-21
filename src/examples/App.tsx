import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CirclePlacementExample } from '.';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <CirclePlacementExample />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  }
});

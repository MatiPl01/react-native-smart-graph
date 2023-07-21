import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CirclesPlacementExample } from '.';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <CirclesPlacementExample />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  }
});

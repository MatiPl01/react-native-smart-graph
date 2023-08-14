import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import BottomSheetFocus from './examples/BottomSheetFocus.example';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetFocus />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1
  }
});

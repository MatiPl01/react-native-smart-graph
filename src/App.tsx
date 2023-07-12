import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import MultiStepFocusExample from './examples/focus/MultiStepFocusExamples';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.background}>
      <StatusBar
        backgroundColor='transparent'
        barStyle='light-content'
        translucent
      />
      <SafeAreaView style={styles.container}>
        {/* Place example component here */}
        <MultiStepFocusExample />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'black',
    flex: 1
  },
  container: {
    flex: 1,
    position: 'relative'
  }
});

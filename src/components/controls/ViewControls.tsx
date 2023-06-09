import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowsToCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type ViewControlsProps = {
  onReset: () => void;
};

export default function ViewControls({ onReset }: ViewControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onReset}>
        <FontAwesomeIcon
          style={styles.icon}
          icon={faArrowsToCircle as IconProp}
          size={32}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, .5)'
  },
  icon: {
    color: 'white'
  }
});

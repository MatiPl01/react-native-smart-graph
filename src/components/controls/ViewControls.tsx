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
          icon={faArrowsToCircle as IconProp}
          size={32}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, .5)',
    borderRadius: 8,
    padding: 8,
    position: 'absolute',
    right: 12,
    top: 12
  },
  icon: {
    color: 'white'
  }
});

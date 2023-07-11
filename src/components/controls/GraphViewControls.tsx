/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowsToCircle,
  faCompress,
  faExpand,
  faRectangleTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { memo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';

import { DEFAULT_FOCUS_ANIMATION_SETTINGS } from '@/constants/animations';
import {
  FocusStatus,
  useAutoSizingContext,
  useCanvasDataContext,
  useFocusContext,
  useTransformContext
} from '@/providers/canvas';
import { ObjectFit } from '@/types/views';

const OBJECT_FIT_BUTTONS: Array<{ icon: IconDefinition; type: ObjectFit }> = [
  {
    icon: faCompress,
    type: 'contain'
  },
  {
    icon: faExpand,
    type: 'cover'
  },
  {
    icon: faRectangleTimes,
    type: 'none'
  }
];

type GraphViewControlsProps = {
  onObjectFitChange?: (objectFit: ObjectFit) => void;
};

export default memo(function GraphViewControls({
  onObjectFitChange
}: GraphViewControlsProps) {
  // CONTEXTS
  // Canvas data context
  const { initialScale, objectFit } = useCanvasDataContext();
  // Transform context
  const { resetContainerPosition } = useTransformContext();
  // Auto sizing context
  const autoSizingContext = useAutoSizingContext();
  // Focus context
  const { endFocus, focusStatus } = useFocusContext();

  // OTHER VALUES
  // Object fit button index
  const [objectFitButtonIndex, setObjectFitButtonIndex] = useState(
    OBJECT_FIT_BUTTONS.findIndex(({ type }) => type === objectFit.value)
  );
  const nextObjectFitButtonIndex =
    (objectFitButtonIndex + 1) % OBJECT_FIT_BUTTONS.length;

  useAnimatedReaction(
    () => objectFit.value,
    nextObjectFit => {
      runOnJS(setObjectFitButtonIndex)(
        OBJECT_FIT_BUTTONS.findIndex(({ type }) => type === nextObjectFit)
      );
    }
  );

  const handleReset = () => {
    if (focusStatus.value === FocusStatus.BLUR) {
      resetContainerPosition({
        animationSettings: DEFAULT_FOCUS_ANIMATION_SETTINGS,
        autoSizingContext,
        scale: initialScale.value
      });
    } else {
      endFocus(undefined, DEFAULT_FOCUS_ANIMATION_SETTINGS);
    }
  };

  const handleObjectFitChange = () => {
    const nextObjectFit = OBJECT_FIT_BUTTONS[nextObjectFitButtonIndex]!.type;
    onObjectFitChange?.(nextObjectFit);
  };

  const buttons = [
    {
      icon: faArrowsToCircle,
      key: 'reset',
      onPress: handleReset
    }
  ];

  if (onObjectFitChange) {
    buttons.push({
      icon: OBJECT_FIT_BUTTONS[nextObjectFitButtonIndex]!.icon,
      key: 'object-fit',
      onPress: handleObjectFitChange
    });
  }

  return (
    <View style={styles.container}>
      {buttons.map(({ icon, key, onPress }) => (
        <TouchableOpacity key={key} onPress={onPress}>
          <FontAwesomeIcon icon={icon} size={32} style={styles.icon} />
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, .5)',
    borderRadius: 8,
    gap: 20,
    padding: 8,
    position: 'absolute',
    right: 0,
    top: 0
  },
  icon: {
    color: 'white'
  }
});

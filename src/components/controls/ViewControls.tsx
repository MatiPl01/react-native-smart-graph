import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowsToCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { styled } from 'nativewind';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

const StyledFontAwesomeIcon = styled(FontAwesomeIcon);

type ViewControlsProps = {
  onReset: () => void;
};

export default function ViewControls({ onReset }: ViewControlsProps) {
  return (
    <View className='absolute top-2 right-2 p-2 rounded-lg bg-black/[.5]'>
      <TouchableOpacity onPress={onReset}>
        <StyledFontAwesomeIcon
          className='text-white'
          icon={faArrowsToCircle as IconProp}
          size={24}
        />
      </TouchableOpacity>
    </View>
  );
}

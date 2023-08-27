/* eslint-disable import/no-unused-modules */
import { Vertices } from '@shopify/react-native-skia';
import React from 'react';

export default function DefaultArrowRenderer() {
  const color = '#999';
  const colors = [color, color, color];

  return (
    <Vertices
      vertices={[
        { x: -20, y: -10 },
        { x: -20, y: 10 },
        { x: 20, y: 0 }
      ]}
      colors={colors}
    />
  );
}

/* eslint-disable new-cap */
import { FontStyle, Skia } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

import { DEFAULT_COMPONENTS_SETTINGS } from '@/configs/graph';

const familyName = Platform.select({
  android: 'Roboto',
  default: 'serif',
  ios: 'Helvetica'
});

const fontSize = DEFAULT_COMPONENTS_SETTINGS.vertex.radius;
const fontMgr = Skia.FontMgr.System();

const FONT = {
  regular: Skia.Font(
    fontMgr.matchFamilyStyle(familyName, FontStyle.Normal),
    fontSize
  )
};

export default FONT;

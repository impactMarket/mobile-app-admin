import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { DefaultTheme } from 'react-native-paper';
import { ipctColors } from './index';

export const theme = {
    ...DefaultTheme,
    roundness: 4,
    colors: {
        ...DefaultTheme.colors,
        primary: ipctColors.blueRibbon,
    },
};
export const navigationTheme = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        primary: ipctColors.blueRibbon,
        background: '#ffffff',
    },
};

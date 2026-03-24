import React from 'react';
import { TamaguiProvider } from 'tamagui';
import { NavigationIndependentTree } from '@react-navigation/native';
import tamaguiConfig from '../tamagui.config';
import { SessionProvider } from '../context/SessionContext';
import AppNavigator from '../navigation/AppNavigator';

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <SessionProvider>
        <NavigationIndependentTree>
          <AppNavigator />
        </NavigationIndependentTree>
      </SessionProvider>
    </TamaguiProvider>
  );
}

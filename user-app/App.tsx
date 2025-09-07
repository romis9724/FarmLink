import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// React Native Paper 테마 설정
const theme = {
  colors: {
    primary: '#1877F2',
    accent: '#4CAF50',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#333333',
    placeholder: '#999999',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#333333',
    disabled: '#cccccc',
    error: '#dc3545',
  },
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#1877F2" 
        />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;

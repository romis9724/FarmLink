import React from 'react';
import { StatusBar, View, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SimpleNavigator from './src/navigation/SimpleNavigator';

// 오류 경계 컴포넌트
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#dc3545', marginBottom: 10 }}>
            앱 오류가 발생했습니다
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
          </Text>
          <Text 
            style={{ fontSize: 14, color: '#1877F2', textDecorationLine: 'underline' }}
            onPress={() => window.location.reload()}
          >
            페이지 새로고침
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="#1877F2" 
          />
          <SimpleNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;

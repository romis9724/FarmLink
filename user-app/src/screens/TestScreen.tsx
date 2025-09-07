import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TestScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>테스트 화면</Text>
      <Text style={styles.subtitle}>이 화면이 보인다면 네비게이션이 정상 작동합니다!</Text>
      <View style={styles.content}>
        <Text style={styles.text}>• 센서 데이터 모니터링</Text>
        <Text style={styles.text}>• 디바이스 상태 확인</Text>
        <Text style={styles.text}>• 실시간 업데이트</Text>
        <Text style={styles.text}>• 반응형 UI</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingBottom: 80, // 탭바 높이 + 여백
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877F2',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});

export default TestScreen;

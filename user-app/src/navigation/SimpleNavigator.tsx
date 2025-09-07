import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import ThresholdSettingsScreen from '../screens/ThresholdSettingsScreen';
import TestScreen from '../screens/TestScreen';

type ScreenType = 'dashboard' | 'threshold' | 'settings';

const SimpleNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'threshold':
        return <ThresholdSettingsScreen />;
      case 'settings':
        return <TestScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Farm Link';
      case 'threshold':
        return '임계치 설정';
      case 'settings':
        return '앱 설정';
      default:
        return 'Farm Link';
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* 하단 탭 네비게이션 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, currentScreen === 'dashboard' && styles.activeTab]}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'dashboard' && styles.activeTabIcon]}>
            📊
          </Text>
          <Text style={[styles.tabLabel, currentScreen === 'dashboard' && styles.activeTabLabel]}>
            대시보드
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === 'threshold' && styles.activeTab]}
          onPress={() => setCurrentScreen('threshold')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'threshold' && styles.activeTabIcon]}>
            ⚙️
          </Text>
          <Text style={[styles.tabLabel, currentScreen === 'threshold' && styles.activeTabLabel]}>
            임계치
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentScreen === 'settings' && styles.activeTab]}
          onPress={() => setCurrentScreen('settings')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'settings' && styles.activeTabIcon]}>
            🔧
          </Text>
          <Text style={[styles.tabLabel, currentScreen === 'settings' && styles.activeTabLabel]}>
            설정
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1877F2',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  activeTabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeTabLabel: {
    color: '#1877F2',
    fontWeight: '600',
  },
});

export default SimpleNavigator;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// 웹에서는 간단한 텍스트 아이콘 사용
const Icon = ({ name, size = 24, color = '#666' }) => {
  const iconMap = {
    'dashboard': '📊',
    'history': '📈',
    'settings': '⚙️',
    'help': '❓',
  };
  return (
    <span style={{ fontSize: size, color }}>
      {iconMap[name] || '📊'}
    </span>
  );
};
import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Dashboard') {
              iconName = 'dashboard';
            } else if (route.name === 'History') {
              iconName = 'history';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            } else {
              iconName = 'help';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1877F2',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#1877F2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            title: '대시보드',
            headerTitle: 'Farm Link',
          }}
        />
        <Tab.Screen 
          name="History" 
          component={DashboardScreen} // 임시로 같은 컴포넌트 사용
          options={{
            title: '히스토리',
            headerTitle: '센서 히스토리',
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={DashboardScreen} // 임시로 같은 컴포넌트 사용
          options={{
            title: '설정',
            headerTitle: '앱 설정',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

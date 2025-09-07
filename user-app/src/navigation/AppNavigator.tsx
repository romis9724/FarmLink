import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '../components/Icon';
import DashboardScreen from '../screens/DashboardScreen';
import TestScreen from '../screens/TestScreen';

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  return (
    <View style={styles.container}>
      <NavigationContainer
        independent={true}
        theme={{
          colors: {
            primary: '#1877F2',
            background: '#f8fafc',
            card: '#ffffff',
            text: '#333333',
            border: '#e0e0e0',
            notification: '#dc3545',
          },
        }}
      >
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
            tabBarPosition: 'bottom',
            tabBarHideOnKeyboard: false,
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
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
            component={TestScreen}
            options={{
              title: '히스토리',
              headerTitle: '센서 히스토리',
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={TestScreen}
            options={{
              title: '설정',
              headerTitle: '앱 설정',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});

export default AppNavigator;

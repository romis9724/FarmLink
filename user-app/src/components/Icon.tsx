import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#666', style }) => {
  const iconMap: { [key: string]: string } = {
    // Navigation icons
    'dashboard': '📊',
    'history': '📈',
    'settings': '⚙️',
    'help': '❓',
    
    // Sensor icons
    'eco': '🌱',
    'device-hub': '📱',
    'device-unknown': '❓',
    'refresh': '🔄',
    'water-drop': '💧',
    'thermostat': '🌡️',
    'air': '💨',
    'light-mode': '☀️',
    'error-outline': '❌',
    
    // Default fallback
    'default': '📊',
  };

  const iconChar = iconMap[name] || iconMap['default'];

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.icon, { fontSize: size, color }]}>
        {iconChar}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
    lineHeight: 1,
  },
});

export default Icon;

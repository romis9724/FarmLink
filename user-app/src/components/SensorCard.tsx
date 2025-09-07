import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import Icon from './Icon';
import { FarmLinkAPI, SensorData } from '../lib/api';

interface SensorCardProps {
  title: string;
  icon: string;
  valueKey: keyof SensorData;
  unit: string;
  type: 'moisture' | 'temperature' | 'humidity' | 'light';
  deviceId: string;
  refreshInterval?: number;
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  icon,
  valueKey,
  unit,
  type,
  deviceId,
  refreshInterval = 5000,
}) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const getStatusColor = (value: number, type: string): 'success' | 'warning' | 'error' => {
    switch (type) {
      case 'moisture':
        return value < 20 ? 'error' : value < 50 ? 'warning' : 'success';
      case 'temperature':
        return value > 35 ? 'error' : value > 30 ? 'warning' : 'success';
      case 'humidity':
        return value > 80 ? 'error' : value > 70 ? 'warning' : 'success';
      case 'light':
        return value > 80 ? 'error' : value > 60 ? 'warning' : 'success';
      default:
        return 'success';
    }
  };

  const getStatusText = (value: number, type: string): string => {
    switch (type) {
      case 'moisture':
        return value < 20 ? '건조' : value < 50 ? '보통' : '적정';
      case 'temperature':
        return value > 35 ? '높음' : value > 30 ? '보통' : '적정';
      case 'humidity':
        return value > 80 ? '높음' : value > 70 ? '보통' : '적정';
      case 'light':
        return value > 80 ? '강함' : value > 60 ? '보통' : '적정';
      default:
        return '정상';
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await FarmLinkAPI.getLatestSensorData(deviceId);
      
      if (data) {
        setSensorData(data);
        // 페이드 인 애니메이션
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        setError('데이터를 불러올 수 없습니다');
      }
    } catch (err) {
      setError('데이터 로딩 실패');
      console.error('센서 데이터 로딩 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId, fadeAnim]);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const getCardColor = () => {
    if (loading || error) return '#f5f5f5';
    
    const value = sensorData?.[valueKey] as number;
    if (typeof value !== 'number') return '#f5f5f5';
    
    const status = getStatusColor(value, type);
    switch (status) {
      case 'success': return '#e8f5e8';
      case 'warning': return '#fff3cd';
      case 'error': return '#f8d7da';
      default: return '#f5f5f5';
    }
  };

  const getIconColor = () => {
    if (loading || error) return '#666';
    
    const value = sensorData?.[valueKey] as number;
    if (typeof value !== 'number') return '#666';
    
    const status = getStatusColor(value, type);
    switch (status) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#666';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1877F2" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={24} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    const value = sensorData?.[valueKey] as number;
    const status = typeof value === 'number' ? getStatusColor(value, type) : 'success';
    const statusText = typeof value === 'number' ? getStatusText(value, type) : '정상';

    return (
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {typeof value === 'number' ? value.toFixed(1) : '--'}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <Chip 
          mode="outlined" 
          textStyle={styles.chipText}
          style={[
            styles.chip,
            {
              borderColor: status === 'success' ? '#28a745' : 
                          status === 'warning' ? '#ffc107' : '#dc3545'
            }
          ]}
        >
          {statusText}
        </Chip>
      </Animated.View>
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: getCardColor() }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name={icon} size={24} color={getIconColor()} />
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        {renderContent()}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 0,
    elevation: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  content: {
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1877F2',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  chip: {
    marginTop: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SensorCard;
